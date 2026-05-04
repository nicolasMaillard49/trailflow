--
-- PostgreSQL database dump
--

\restrict 06pBn3rg09ihloHDNMWfmB7GPRsiWiHYnkUpsQxqisfEVFbuC5uB7jE6QEUyxHE

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PAID',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Admin" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Admin" OWNER TO postgres;

--
-- Name: Bundle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Bundle" (
    id text NOT NULL,
    slug text NOT NULL,
    label text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    price double precision NOT NULL,
    "comparePrice" double precision,
    badge text,
    "position" integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Bundle" OWNER TO postgres;

--
-- Name: BundleItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BundleItem" (
    id text NOT NULL,
    "bundleId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."BundleItem" OWNER TO postgres;

--
-- Name: FailedEmail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FailedEmail" (
    id text NOT NULL,
    "to" text NOT NULL,
    subject text NOT NULL,
    payload jsonb NOT NULL,
    template text NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    "lastError" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FailedEmail" OWNER TO postgres;

--
-- Name: Order_orderNumber_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Order_orderNumber_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Order_orderNumber_seq" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "customerEmail" text NOT NULL,
    "customerName" text NOT NULL,
    "shippingAddress" jsonb NOT NULL,
    total double precision NOT NULL,
    "stripeSessionId" text,
    "stripePaymentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "trackingNumber" text,
    "trackingUrl" text,
    "orderNumber" integer DEFAULT nextval('public."Order_orderNumber_seq"'::regclass) NOT NULL,
    "supplierOrderId" text,
    "supplierUrl" text,
    "customerPhone" text DEFAULT ''::text NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL,
    variant text,
    "bundleSlug" text,
    size text,
    color text
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: ProcessedStripeEvent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProcessedStripeEvent" (
    "eventId" text NOT NULL,
    type text NOT NULL,
    "processedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProcessedStripeEvent" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    price double precision NOT NULL,
    "comparePrice" double precision,
    images text[],
    variants jsonb,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "supplierUrl" text,
    "costPrice" double precision DEFAULT 0 NOT NULL,
    "orderImage" text,
    "stripeImage" text
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Admin" (id, email, "passwordHash", "createdAt") FROM stdin;
75dc3954-a2ca-4980-b3c9-c3bdf3f871f8	admin@trailflow.boutique	$2b$10$X8QE.79pvrqZltGd5kOO5O4MH2yHYuGlJuTFHKjVmF41NrEN7WCuC	2026-05-04 07:00:14.846
\.


--
-- Data for Name: Bundle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Bundle" (id, slug, label, description, price, "comparePrice", badge, "position", active, "createdAt", "updatedAt") FROM stdin;
102250cf-ec42-4013-9acc-6cc53d1dfd7c	pack-hydratation	Pack Hydratation	Gilet TrailFlow + 2 flasques 500ml	39.9	57.8	-31%	1	t	2026-05-04 07:00:14.774	2026-05-04 07:00:14.774
\.


--
-- Data for Name: BundleItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BundleItem" (id, "bundleId", "productId", quantity) FROM stdin;
6e13ef35-1961-4f10-a8cb-e526d29cbb39	102250cf-ec42-4013-9acc-6cc53d1dfd7c	8c45adb1-88c8-4473-8cbf-2cee90d41d84	1
b16e1b33-58d4-4f27-935a-556a4a01b763	102250cf-ec42-4013-9acc-6cc53d1dfd7c	9f7f4dac-56f3-4462-9379-ee8d59ddac78	1
\.


--
-- Data for Name: FailedEmail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FailedEmail" (id, "to", subject, payload, template, attempts, "lastError", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, status, "customerEmail", "customerName", "shippingAddress", total, "stripeSessionId", "stripePaymentId", "createdAt", "updatedAt", "trackingNumber", "trackingUrl", "orderNumber", "supplierOrderId", "supplierUrl", "customerPhone") FROM stdin;
50ae5f5c-d97b-4866-8eeb-5c2c7d8620e8	PAID	nico39320@gmail.com	Nicolas Maillard	{"city": "Brissac Quincé", "line1": "13 Rue des Lavandières", "line2": "", "country": "FR", "postalCode": "49320"}	34.9	cs_test_b1xnmTKNoo1iZNdoIOVAwCsZk8A0Fepz4s3axp5bFWp7Tjt1ZdQ2QqTcDd	pi_3TTKITCC4cB5u11e0E5RgbmJ	2026-05-04 11:04:01.215	2026-05-04 11:04:22.924	\N	\N	1	\N	\N	+33615907873
43827e93-455f-4478-a760-5a6b4ba67ea3	PAID	nico39320@gmail.com	Nicolas Maillard	{"city": "Brissac Quincé", "line1": "13 Rue des Lavandières", "line2": "", "country": "FR", "postalCode": "49320"}	34.9	cs_test_b1TBWLYnt3XAaOU6A5xCHwRM5A8h5uPyDZPSID4Lq7E0TtgirTd1tFIuV7	pi_3TTMWiCC4cB5u11e0Zi3MLgE	2026-05-04 13:26:34.857	2026-05-04 13:27:13.85	\N	\N	2	\N	\N	+33615907873
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "productId", quantity, price, variant, "bundleSlug", size, color) FROM stdin;
26156752-9c5d-4892-bb06-f3dd21c627db	50ae5f5c-d97b-4866-8eeb-5c2c7d8620e8	8c45adb1-88c8-4473-8cbf-2cee90d41d84	1	34.9	\N	\N	\N	\N
d182ede9-3150-4455-9d9f-fdc13cf2a0ea	43827e93-455f-4478-a760-5a6b4ba67ea3	8c45adb1-88c8-4473-8cbf-2cee90d41d84	1	34.9	\N	\N	\N	\N
\.


--
-- Data for Name: ProcessedStripeEvent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProcessedStripeEvent" ("eventId", type, "processedAt") FROM stdin;
evt_3TTMWiCC4cB5u11e0K1JMyCE	charge.succeeded	2026-05-04 13:27:13.471
evt_3TTMWiCC4cB5u11e0oXWl20O	payment_intent.succeeded	2026-05-04 13:27:13.646
evt_3TTMWiCC4cB5u11e0yM5IBAj	payment_intent.created	2026-05-04 13:27:13.705
evt_1TTMWjCC4cB5u11eao4MDET5	checkout.session.completed	2026-05-04 13:27:13.839
evt_3TTMWiCC4cB5u11e0gSvCfB1	charge.updated	2026-05-04 13:27:16.071
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, slug, description, price, "comparePrice", images, variants, active, "createdAt", "updatedAt", "supplierUrl", "costPrice", "orderImage", "stripeImage") FROM stdin;
8c45adb1-88c8-4473-8cbf-2cee90d41d84	Gilet TrailFlow	gilet-trailflow	Gilet d'hydratation trail & running — mesh réfléchissant 360°, 2 poches avant flasques, 1 poche zippée téléphone, poche zippée dos, boucles click anti-ballottement.	34.9	49.9	{/images/product-face.png,/images/product-face-sol.png,/images/product-3quart.png,/images/product-cote-droit.png,/images/product-dos.png,/images/product-cote-gauche.png,/images/product-details.png}	{"sizes": [{"name": "S", "value": "s"}, {"name": "M", "value": "m"}, {"name": "L", "value": "l"}, {"name": "XL", "value": "xl"}]}	t	2026-05-04 07:00:14.726	2026-05-04 07:00:14.726	https://www.aliexpress.com/item/1005010186203421.html	7.79	\N	/images/product-face.png
9f7f4dac-56f3-4462-9379-ee8d59ddac78	Pack 2 flasques 500ml	flasques-500ml	Pack de 2 flasques souples 500ml compatibles avec les poches avant du gilet.	7.9	\N	{/images/flasques.png}	\N	f	2026-05-04 07:00:14.768	2026-05-04 07:00:14.768	\N	2.5	\N	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
4c621710-5e0e-4376-abb3-ebbdc419d753	4aa8bf8a95407c8fd62b1ff9b542c776801cfc2c3b4ade03a3c177c68c2354d1	2026-05-04 07:00:01.421859+00	20260324213509_init	\N	\N	2026-05-04 07:00:01.303119+00	1
b3a4af1e-0340-4c33-97c6-c29fcadf890b	53fe76587783eb21ffaf79ce966598ca61d800ddc19350b4cda31d5a6469f58b	2026-05-04 07:00:01.473826+00	20260324220653_init	\N	\N	2026-05-04 07:00:01.425892+00	1
dd4a0cb2-2184-4a2e-bed4-2042670fa9f2	0f4609a22d36176e76a2983f1bc6338f761d1898d22e77acf1db28dc147b8bf6	2026-05-04 07:00:01.491269+00	20260325130034_add_order_tracking_fields	\N	\N	2026-05-04 07:00:01.477668+00	1
b3518d8e-e27c-41e6-8a48-ba0fb783a878	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2026-05-04 07:00:01.502317+00	20260325130043_add_order_tracking_fields	\N	\N	2026-05-04 07:00:01.495543+00	1
77629f81-ff28-461b-807c-622f0fb32c8f	e5446a478a0d271af9aee53b20a46b2a514c237675576fec20b2cb8d1899fd78	2026-05-04 07:00:01.56515+00	20260325140000_add_order_number	\N	\N	2026-05-04 07:00:01.505558+00	1
7ebe0b7e-57fb-4d19-9a40-f61f3a1a87df	b0999eb5abdfdc29a638dd2248f1374be0f8956d5809f2141ad71e8316b530cb	2026-05-04 07:00:01.583948+00	20260325200403_add_supplier_fields	\N	\N	2026-05-04 07:00:01.569464+00	1
c0a7a328-1192-4ce2-bbee-3654112d3201	5876b51fc744591c1841a6eb8852f6d6f22ea90f2e071cfaf425a0ed25f1bce7	2026-05-04 07:00:01.598144+00	20260328102952_add_product_cost_price	\N	\N	2026-05-04 07:00:01.587358+00	1
bf1ec740-694e-480b-b03e-c7bb350cddab	830907c27f8046a364ad1c8b89b5cca85286427e9b86f29f60d405b8ebd1b9cb	2026-05-04 07:00:01.61255+00	20260328113346_add_stripe_order_image	\N	\N	2026-05-04 07:00:01.601512+00	1
3812d679-455d-430c-956a-ebdc219fea0b	e5ed91aceee0abb332f0c0032787ce8c0faac027b858402f8c98fbd56b4a78b1	2026-05-04 07:00:01.6263+00	20260330192207_add_customer_phone	\N	\N	2026-05-04 07:00:01.615865+00	1
ad5f0c6e-04c6-4038-a2b7-0e91f8cc1461	4aa4f3efaac11f747e49e9fc976602991c23e460bfc091b67d039b60915b197b	2026-05-04 07:00:01.69298+00	20260409150645_add_bundles	\N	\N	2026-05-04 07:00:01.629637+00	1
79f9f980-822d-4e93-9081-b195d7e9f94f	53ba290ec0e118cb3d4b511ec97007c8d69271c3af235ed7cfc812366c432916	2026-05-04 11:30:36.914063+00	20260504120000_idempotency_dead_letter_index	\N	\N	2026-05-04 11:30:36.839453+00	1
24c97595-679e-4187-8f08-576030e6784a	17eff762d93d19ba0e276a68e5d7d1628ea96324492155a090f3836661bedce0	2026-05-04 13:36:58.818246+00	20260504140000_orderitem_size_color	\N	\N	2026-05-04 13:36:58.808679+00	1
\.


--
-- Name: Order_orderNumber_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Order_orderNumber_seq"', 2, true);


--
-- Name: Admin Admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_pkey" PRIMARY KEY (id);


--
-- Name: BundleItem BundleItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BundleItem"
    ADD CONSTRAINT "BundleItem_pkey" PRIMARY KEY (id);


--
-- Name: Bundle Bundle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Bundle"
    ADD CONSTRAINT "Bundle_pkey" PRIMARY KEY (id);


--
-- Name: FailedEmail FailedEmail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FailedEmail"
    ADD CONSTRAINT "FailedEmail_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: ProcessedStripeEvent ProcessedStripeEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProcessedStripeEvent"
    ADD CONSTRAINT "ProcessedStripeEvent_pkey" PRIMARY KEY ("eventId");


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Admin_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Admin_email_key" ON public."Admin" USING btree (email);


--
-- Name: BundleItem_bundleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "BundleItem_bundleId_idx" ON public."BundleItem" USING btree ("bundleId");


--
-- Name: BundleItem_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "BundleItem_productId_idx" ON public."BundleItem" USING btree ("productId");


--
-- Name: Bundle_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Bundle_slug_key" ON public."Bundle" USING btree (slug);


--
-- Name: FailedEmail_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FailedEmail_createdAt_idx" ON public."FailedEmail" USING btree ("createdAt");


--
-- Name: FailedEmail_template_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FailedEmail_template_idx" ON public."FailedEmail" USING btree (template);


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: OrderItem_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderItem_productId_idx" ON public."OrderItem" USING btree ("productId");


--
-- Name: Order_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_createdAt_idx" ON public."Order" USING btree ("createdAt");


--
-- Name: Order_customerEmail_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_customerEmail_idx" ON public."Order" USING btree ("customerEmail");


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_status_idx" ON public."Order" USING btree (status);


--
-- Name: Order_stripeSessionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON public."Order" USING btree ("stripeSessionId");


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: BundleItem BundleItem_bundleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BundleItem"
    ADD CONSTRAINT "BundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES public."Bundle"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BundleItem BundleItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BundleItem"
    ADD CONSTRAINT "BundleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 06pBn3rg09ihloHDNMWfmB7GPRsiWiHYnkUpsQxqisfEVFbuC5uB7jE6QEUyxHE

