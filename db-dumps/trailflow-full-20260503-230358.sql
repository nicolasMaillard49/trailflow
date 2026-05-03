--
-- PostgreSQL database dump
--

\restrict wKV1o6AfRQbYuptIo7rNLsOmy3y5lMOghqafrt4t77gdR4c9lp8QfdaktFPnPpQ

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

DROP DATABASE IF EXISTS trailflow_dev;
--
-- Name: trailflow_dev; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE trailflow_dev WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


\unrestrict wKV1o6AfRQbYuptIo7rNLsOmy3y5lMOghqafrt4t77gdR4c9lp8QfdaktFPnPpQ
\connect trailflow_dev
\restrict wKV1o6AfRQbYuptIo7rNLsOmy3y5lMOghqafrt4t77gdR4c9lp8QfdaktFPnPpQ

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
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PAID',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Admin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Admin" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Bundle; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: BundleItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BundleItem" (
    id text NOT NULL,
    "bundleId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL
);


--
-- Name: Order_orderNumber_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Order_orderNumber_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL,
    variant text,
    "bundleSlug" text
);


--
-- Name: Product; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
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


--
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Admin" (id, email, "passwordHash", "createdAt") FROM stdin;
d509a5b6-e534-4405-9693-20bb83e1a757	admin@trailflow.shop	$2b$10$FXtMYRWR84LX94W/d7j4RORDysB8xTU5P3iD6tS2dBA04EEPbLkSS	2026-05-03 13:10:10.562
431bf734-52d9-432f-8234-8a4c871c6579	admin@trailflow.boutique	$2b$10$eNWPW0o5ph.2OWr36EvK0OWLfBkje0MXgE39iUwp25FdBvZRnzWIS	2026-05-03 16:45:24.254
\.


--
-- Data for Name: Bundle; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Bundle" (id, slug, label, description, price, "comparePrice", badge, "position", active, "createdAt", "updatedAt") FROM stdin;
d6721f74-afd4-4432-8cb2-d1d7c2c247cb	pack-hydratation	Pack Hydratation	Gilet TrailFlow + 2 flasques 500ml	39.9	57.8	-31%	1	t	2026-05-03 13:10:10.497	2026-05-03 16:45:24.183
\.


--
-- Data for Name: BundleItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BundleItem" (id, "bundleId", "productId", quantity) FROM stdin;
076262d2-d55e-466b-a6e0-00358ac8f0b3	d6721f74-afd4-4432-8cb2-d1d7c2c247cb	75e6e36a-6dc7-4549-aae7-7199f1c639e0	1
b0efce54-2d8a-4912-83d1-54f1773b4608	d6721f74-afd4-4432-8cb2-d1d7c2c247cb	934bb648-0108-430b-a7f5-57901053823e	1
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Order" (id, status, "customerEmail", "customerName", "shippingAddress", total, "stripeSessionId", "stripePaymentId", "createdAt", "updatedAt", "trackingNumber", "trackingUrl", "orderNumber", "supplierOrderId", "supplierUrl", "customerPhone") FROM stdin;
270354e9-bd57-4022-b6a1-3dca226b8c0a	PENDING	nico39320@gmail.com	Nicolas Maillard	{"city": "Brissac Quincé", "line1": "13 Rue des Lavandières", "line2": "", "country": "FR", "postalCode": "49320"}	69.8	\N	\N	2026-05-03 17:20:07.162	2026-05-03 17:20:07.162	\N	\N	1	\N	\N	+33615907873
5a375f29-775e-4ce0-8710-c04bf1c93e5a	SHIPPED	nico39320@gmail.com	Nicolas Maillard	{"city": "Brissac Quincé", "line1": "13 Rue des Lavandières", "line2": "", "country": "FR", "postalCode": "49320"}	34.9	cs_test_b1UHL76S5FatCAkW1vghQS9wRGSmE4yjknCW4fn2TGetl15Q0O3jIeTTLu	\N	2026-05-03 20:11:36.67	2026-05-03 20:15:39.988	\N	\N	3	\N	\N	+33615907873
2df91563-e983-4c36-bd51-67e4f93423aa	PROCESSING	nico39320@gmail.com	Nicolas Maillard	{"city": "Brissac Quincé", "line1": "13 Rue des Lavandières", "line2": "", "country": "FR", "postalCode": "49320"}	34.9	cs_test_b12Hl1TlkbfJwCu9zUfEjKjwhcpOysnOxtooA5k89J90DDg3jI5g1dyiMY	\N	2026-05-03 19:39:30.338	2026-05-03 20:26:02.543	\N	\N	2	\N	\N	+33615907873
06cd5690-c0f6-4050-8a2f-7376f57d2160	SHIPPED	nico39320@gmail.com	Nicolas Maillard	{"city": "Brissac Quincé", "line1": "13 Rue des Lavandières", "line2": "", "country": "FR", "postalCode": "49320"}	34.9	cs_test_b1leNGnpnvI1ANPRdvaDmnegOxKY3wroexWx2A0hNl4SoqGX9zvR9NS9AL	pi_3TT6ffCC4cB5u11e0S156EvR	2026-05-03 20:31:00.413	2026-05-03 20:36:35.018	\N	\N	4	\N	\N	+33615907873
519e2db7-9c76-4e79-b7b2-fca6f3ca4e1c	PAID	nico39320@gmail.com	Nicolas Maillard	{"city": "Brissac Quincé", "line1": "13 Rue des Lavandières", "line2": "", "country": "FR", "postalCode": "49320"}	34.9	cs_test_b1zcmDMGNed0SQV0yFimwkJ2zH3c9aFe2Mg5VE5Vvdqv60qC8PtjMdcgnY	pi_3TT6qyCC4cB5u11e1ISdc4xH	2026-05-03 20:42:33.126	2026-05-03 20:43:05.615	\N	\N	5	\N	\N	+33615907873
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderItem" (id, "orderId", "productId", quantity, price, variant, "bundleSlug") FROM stdin;
e274c33e-2859-449a-bb4d-73940b3154d4	270354e9-bd57-4022-b6a1-3dca226b8c0a	75e6e36a-6dc7-4549-aae7-7199f1c639e0	2	34.9	\N	\N
5285118a-b0a6-4280-ab75-084701c8264e	2df91563-e983-4c36-bd51-67e4f93423aa	75e6e36a-6dc7-4549-aae7-7199f1c639e0	1	34.9	\N	\N
e6121692-fae0-487a-9906-c4fb3abc7a3b	5a375f29-775e-4ce0-8710-c04bf1c93e5a	75e6e36a-6dc7-4549-aae7-7199f1c639e0	1	34.9	\N	\N
ccda35d6-f08f-49c0-8be3-8ab4a2ce0c57	06cd5690-c0f6-4050-8a2f-7376f57d2160	75e6e36a-6dc7-4549-aae7-7199f1c639e0	1	34.9	\N	\N
27f1eff4-6e77-4add-9208-b91fe6447124	519e2db7-9c76-4e79-b7b2-fca6f3ca4e1c	75e6e36a-6dc7-4549-aae7-7199f1c639e0	1	34.9	\N	\N
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Product" (id, name, slug, description, price, "comparePrice", images, variants, active, "createdAt", "updatedAt", "supplierUrl", "costPrice", "orderImage", "stripeImage") FROM stdin;
75e6e36a-6dc7-4549-aae7-7199f1c639e0	Gilet TrailFlow	gilet-trailflow	Gilet d'hydratation trail & running — mesh réfléchissant 360°, 2 poches avant flasques, 1 poche zippée téléphone, poche zippée dos, boucles click anti-ballottement.	34.9	49.9	{/images/product-face.png,/images/product-face-sol.png,/images/product-3quart.png,/images/product-cote-droit.png,/images/product-dos.png,/images/product-cote-gauche.png,/images/product-details.png}	{"sizes": [{"name": "S", "value": "s"}, {"name": "M", "value": "m"}, {"name": "L", "value": "l"}, {"name": "XL", "value": "xl"}]}	t	2026-05-03 13:10:10.457	2026-05-03 16:45:24.118	https://www.aliexpress.com/item/1005010186203421.html	7.79	\N	/images/product-face.png
934bb648-0108-430b-a7f5-57901053823e	Pack 2 flasques 500ml	flasques-500ml	Pack de 2 flasques souples 500ml compatibles avec les poches avant du gilet.	7.9	\N	{/images/flasques.png}	\N	f	2026-05-03 13:10:10.493	2026-05-03 16:45:24.179	\N	2.5	\N	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a4468a3d-b8fe-491e-80a6-7681fc9ce0e9	4aa8bf8a95407c8fd62b1ff9b542c776801cfc2c3b4ade03a3c177c68c2354d1	2026-05-03 13:09:46.838267+00	20260324213509_init	\N	\N	2026-05-03 13:09:46.786968+00	1
bb102025-0425-4983-a36d-8c6723833d76	53fe76587783eb21ffaf79ce966598ca61d800ddc19350b4cda31d5a6469f58b	2026-05-03 13:09:46.862257+00	20260324220653_init	\N	\N	2026-05-03 13:09:46.839969+00	1
636fd284-7be6-4719-9ad9-2233b16f99b3	0f4609a22d36176e76a2983f1bc6338f761d1898d22e77acf1db28dc147b8bf6	2026-05-03 13:09:46.868678+00	20260325130034_add_order_tracking_fields	\N	\N	2026-05-03 13:09:46.86364+00	1
97f3489d-df85-4f9b-b859-12716c954a7f	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2026-05-03 13:09:46.873547+00	20260325130043_add_order_tracking_fields	\N	\N	2026-05-03 13:09:46.870417+00	1
7a8bf597-4406-4adc-99e5-5cce803c97b7	e5446a478a0d271af9aee53b20a46b2a514c237675576fec20b2cb8d1899fd78	2026-05-03 13:09:46.90129+00	20260325140000_add_order_number	\N	\N	2026-05-03 13:09:46.875207+00	1
8d702dd1-af24-4d21-acca-cf12375e2cee	b0999eb5abdfdc29a638dd2248f1374be0f8956d5809f2141ad71e8316b530cb	2026-05-03 13:09:46.908659+00	20260325200403_add_supplier_fields	\N	\N	2026-05-03 13:09:46.90303+00	1
50b4cfd2-4e78-4a99-a9bd-d2da31054b4e	5876b51fc744591c1841a6eb8852f6d6f22ea90f2e071cfaf425a0ed25f1bce7	2026-05-03 13:09:46.91501+00	20260328102952_add_product_cost_price	\N	\N	2026-05-03 13:09:46.910229+00	1
52410543-7a5b-49c6-859b-254e6cd62a8a	830907c27f8046a364ad1c8b89b5cca85286427e9b86f29f60d405b8ebd1b9cb	2026-05-03 13:09:46.922069+00	20260328113346_add_stripe_order_image	\N	\N	2026-05-03 13:09:46.9166+00	1
d7155e04-f279-43cf-b49e-0006e8e95455	e5ed91aceee0abb332f0c0032787ce8c0faac027b858402f8c98fbd56b4a78b1	2026-05-03 13:09:46.928918+00	20260330192207_add_customer_phone	\N	\N	2026-05-03 13:09:46.92366+00	1
22a2d677-ac12-4ab4-b185-9b7861c375f0	4aa4f3efaac11f747e49e9fc976602991c23e460bfc091b67d039b60915b197b	2026-05-03 13:09:46.961169+00	20260409150645_add_bundles	\N	\N	2026-05-03 13:09:46.930672+00	1
\.


--
-- Name: Order_orderNumber_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Order_orderNumber_seq"', 5, true);


--
-- Name: Admin Admin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_pkey" PRIMARY KEY (id);


--
-- Name: BundleItem BundleItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BundleItem"
    ADD CONSTRAINT "BundleItem_pkey" PRIMARY KEY (id);


--
-- Name: Bundle Bundle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Bundle"
    ADD CONSTRAINT "Bundle_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Admin_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Admin_email_key" ON public."Admin" USING btree (email);


--
-- Name: BundleItem_bundleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BundleItem_bundleId_idx" ON public."BundleItem" USING btree ("bundleId");


--
-- Name: Bundle_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Bundle_slug_key" ON public."Bundle" USING btree (slug);


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: OrderItem_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OrderItem_productId_idx" ON public."OrderItem" USING btree ("productId");


--
-- Name: Order_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_createdAt_idx" ON public."Order" USING btree ("createdAt");


--
-- Name: Order_customerEmail_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_customerEmail_idx" ON public."Order" USING btree ("customerEmail");


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_status_idx" ON public."Order" USING btree (status);


--
-- Name: Order_stripeSessionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON public."Order" USING btree ("stripeSessionId");


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: BundleItem BundleItem_bundleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BundleItem"
    ADD CONSTRAINT "BundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES public."Bundle"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BundleItem BundleItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BundleItem"
    ADD CONSTRAINT "BundleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict wKV1o6AfRQbYuptIo7rNLsOmy3y5lMOghqafrt4t77gdR4c9lp8QfdaktFPnPpQ

