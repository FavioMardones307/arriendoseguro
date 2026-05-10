-- ═══════════════════════════════════════════════════════════════════════════════
-- ArriendoSeguro — RLS Policies + Auth Trigger
-- Ejecutar en: Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. TRIGGER: auto-crear perfil al registrarse ───────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, rol)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'rol')::public.rol,
      'arrendatario'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. RLS: PROFILES ───────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles: ver el propio" ON public.profiles;
CREATE POLICY "profiles: ver el propio"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: editar el propio" ON public.profiles;
CREATE POLICY "profiles: editar el propio"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: insertar el propio" ON public.profiles;
CREATE POLICY "profiles: insertar el propio"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ─── 3. RLS: PROPERTIES ─────────────────────────────────────────────────────
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "properties: propietario gestiona las suyas" ON public.properties;
CREATE POLICY "properties: propietario gestiona las suyas"
  ON public.properties FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- ─── 4. RLS: CONTRACTS ──────────────────────────────────────────────────────
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contracts: partes ven su contrato" ON public.contracts;
CREATE POLICY "contracts: partes ven su contrato"
  ON public.contracts FOR SELECT
  USING (
    auth.uid() = arrendador_id OR
    auth.uid() = arrendatario_id OR
    auth.uid() = codeudor_id
  );

DROP POLICY IF EXISTS "contracts: arrendador crea/edita" ON public.contracts;
CREATE POLICY "contracts: arrendador crea/edita"
  ON public.contracts FOR INSERT
  WITH CHECK (auth.uid() = arrendador_id);

DROP POLICY IF EXISTS "contracts: arrendador actualiza" ON public.contracts;
CREATE POLICY "contracts: arrendador actualiza"
  ON public.contracts FOR UPDATE
  USING (auth.uid() = arrendador_id)
  WITH CHECK (auth.uid() = arrendador_id);

-- ─── 5. RLS: PAYMENTS ───────────────────────────────────────────────────────
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments: partes ven sus pagos" ON public.payments;
CREATE POLICY "payments: partes ven sus pagos"
  ON public.payments FOR SELECT
  USING (
    contract_id IN (
      SELECT id FROM public.contracts
      WHERE arrendador_id = auth.uid() OR arrendatario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "payments: arrendador inserta pagos" ON public.payments;
CREATE POLICY "payments: arrendador inserta pagos"
  ON public.payments FOR INSERT
  WITH CHECK (
    contract_id IN (
      SELECT id FROM public.contracts WHERE arrendador_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "payments: arrendatario actualiza su pago" ON public.payments;
CREATE POLICY "payments: arrendatario actualiza su pago"
  ON public.payments FOR UPDATE
  USING (
    contract_id IN (
      SELECT id FROM public.contracts WHERE arrendatario_id = auth.uid()
    )
  );

-- ─── 6. RLS: INVENTORIES ────────────────────────────────────────────────────
ALTER TABLE public.inventories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inventories: partes ven sus inventarios" ON public.inventories;
CREATE POLICY "inventories: partes ven sus inventarios"
  ON public.inventories FOR SELECT
  USING (
    contract_id IN (
      SELECT id FROM public.contracts
      WHERE arrendador_id = auth.uid() OR arrendatario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "inventories: arrendador crea inventarios" ON public.inventories;
CREATE POLICY "inventories: arrendador crea inventarios"
  ON public.inventories FOR INSERT
  WITH CHECK (
    contract_id IN (
      SELECT id FROM public.contracts WHERE arrendador_id = auth.uid()
    )
  );

-- ─── 7. RLS: INVENTORY_ITEMS ────────────────────────────────────────────────
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inventory_items: partes ven items" ON public.inventory_items;
CREATE POLICY "inventory_items: partes ven items"
  ON public.inventory_items FOR SELECT
  USING (
    inventory_id IN (
      SELECT i.id FROM public.inventories i
      JOIN public.contracts c ON c.id = i.contract_id
      WHERE c.arrendador_id = auth.uid() OR c.arrendatario_id = auth.uid()
    )
  );

-- ─── 8. RLS: INVENTORY_PHOTOS ───────────────────────────────────────────────
ALTER TABLE public.inventory_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inventory_photos: partes ven fotos" ON public.inventory_photos;
CREATE POLICY "inventory_photos: partes ven fotos"
  ON public.inventory_photos FOR SELECT
  USING (
    item_id IN (
      SELECT ii.id FROM public.inventory_items ii
      JOIN public.inventories i ON i.id = ii.inventory_id
      JOIN public.contracts c ON c.id = i.contract_id
      WHERE c.arrendador_id = auth.uid() OR c.arrendatario_id = auth.uid()
    )
  );

-- ─── 9. RLS: ARRIENDO_SCORE ─────────────────────────────────────────────────
ALTER TABLE public.arriendo_score ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "score: arrendatario ve el suyo" ON public.arriendo_score;
CREATE POLICY "score: arrendatario ve el suyo"
  ON public.arriendo_score FOR SELECT
  USING (auth.uid() = arrendatario_id);

-- ─── 10. RLS: SCORE_EVENTS ──────────────────────────────────────────────────
ALTER TABLE public.score_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "score_events: arrendatario ve los suyos" ON public.score_events;
CREATE POLICY "score_events: arrendatario ve los suyos"
  ON public.score_events FOR SELECT
  USING (auth.uid() = arrendatario_id);

-- ─── 11. RLS: ECONOMIC_INDICATORS (pública lectura) ─────────────────────────
ALTER TABLE public.economic_indicators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "indicators: lectura pública" ON public.economic_indicators;
CREATE POLICY "indicators: lectura pública"
  ON public.economic_indicators FOR SELECT
  USING (true);

-- ─── 12. RLS: NOTIFICATIONS ─────────────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications: usuario ve las suyas" ON public.notifications;
CREATE POLICY "notifications: usuario ve las suyas"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications: usuario actualiza las suyas" ON public.notifications;
CREATE POLICY "notifications: usuario actualiza las suyas"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── 13. RLS: LEGAL_DOCUMENTS (pública lectura) ─────────────────────────────
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "legal_docs: lectura pública" ON public.legal_documents;
CREATE POLICY "legal_docs: lectura pública"
  ON public.legal_documents FOR SELECT
  USING (true);

-- ─── 14. RLS: SERVICE_PAYMENTS ──────────────────────────────────────────────
ALTER TABLE public.service_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_payments: partes ven los suyos" ON public.service_payments;
CREATE POLICY "service_payments: partes ven los suyos"
  ON public.service_payments FOR SELECT
  USING (
    contract_id IN (
      SELECT id FROM public.contracts
      WHERE arrendador_id = auth.uid() OR arrendatario_id = auth.uid()
    )
  );

-- ─── 15. RLS: SUBSCRIPTIONS ─────────────────────────────────────────────────
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions: usuario ve la suya" ON public.subscriptions;
CREATE POLICY "subscriptions: usuario ve la suya"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ─── 16. RLS: AUDIT_LOG (solo service_role puede insertar) ──────────────────
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log: usuario ve sus acciones" ON public.audit_log;
CREATE POLICY "audit_log: usuario ve sus acciones"
  ON public.audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- ─── 17. RLS: USER_CONSENTS ─────────────────────────────────────────────────
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consents: usuario ve y crea los suyos" ON public.user_consents;
CREATE POLICY "consents: usuario ve y crea los suyos"
  ON public.user_consents FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "consents: usuario inserta los suyos" ON public.user_consents;
CREATE POLICY "consents: usuario inserta los suyos"
  ON public.user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── 18. RLS: UTILITY_ACCOUNTS ──────────────────────────────────────────────
ALTER TABLE public.utility_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "utility_accounts: propietario gestiona los suyos" ON public.utility_accounts;
CREATE POLICY "utility_accounts: propietario gestiona los suyos"
  ON public.utility_accounts FOR ALL
  USING (
    property_id IN (
      SELECT id FROM public.properties WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    property_id IN (
      SELECT id FROM public.properties WHERE owner_id = auth.uid()
    )
  );

SELECT 'RLS + Trigger configurados correctamente' AS resultado;
