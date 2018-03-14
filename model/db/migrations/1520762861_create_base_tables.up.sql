CREATE OR REPLACE FUNCTION UPDATE_TIMESTAMP() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW() AT TIME ZONE 'utc';
    RETURN NEW;	
END ;$$ 
LANGUAGE plpgsql VOLATILE
COST 100;


CREATE TABLE IF NOT EXISTS "users" (
    "username" VARCHAR(64) PRIMARY KEY,
    "name" VARCHAR(64) NOT NULL,
    "email" VARCHAR(64) UNIQUE NOT NULL,
    "password" VARCHAR(128) NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

DROP TRIGGER IF EXISTS "SET_UPDATED_AT" ON "users";
CREATE TRIGGER "SET_UPDATED_AT" BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE PROCEDURE UPDATE_TIMESTAMP();

CREATE TABLE IF NOT EXISTS "products" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(64) REFERENCES "users"(username) ON DELETE CASCADE,
    "invoice_id" INT NOT NULL,
    "place_of_purchase" VARCHAR NOT NULL,
    "brand" VARCHAR(24) NOT NULL,
    "class"	VARCHAR(24) NOT NULL,
    "place_of_invoice" VARCHAR(24) NOT NULL,
    "shop" VARCHAR(24) NOT NULL,
    "type" VARCHAR(24) NOT NULL,
    "warranty_void_at" TIMESTAMP NOT NULL,
    "color" VARCHAR(24)[] NOT NULL,
    "material" VARCHAR(24) NOT NULL,
    "comment" TEXT NOT NULL,
    "pictures" VARCHAR[] NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

DROP TRIGGER IF EXISTS "SET_UPDATED_AT" ON "products";
CREATE TRIGGER "SET_UPDATED_AT" BEFORE UPDATE ON "products" FOR EACH ROW EXECUTE PROCEDURE UPDATE_TIMESTAMP();

CREATE INDEX IF NOT EXISTS products_invoice_index on "products" ("invoice_id");
CREATE INDEX IF NOT EXISTS products_place_of_purchase_index on "products" ("place_of_purchase");
CREATE INDEX IF NOT EXISTS products_brand_index on "products" ("brand");
CREATE INDEX IF NOT EXISTS products_class_index on "products" ("class");
CREATE INDEX IF NOT EXISTS products_shop_index on "products" ("shop");
CREATE INDEX IF NOT EXISTS products_type_index on "products" ("type");
CREATE INDEX IF NOT EXISTS products_warranty_void_at_index on "products" ("warranty_void_at");
CREATE INDEX IF NOT EXISTS products_color_index on "products" USING GIN ("color");

CREATE TABLE IF NOT EXISTS "drawer" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(64) REFERENCES "users"(username) ON DELETE CASCADE,
    "username" INT NOT NULL,
    "place_of_purchase" VARCHAR NOT NULL,
    "brand" VARCHAR(24) NOT NULL,
    "class"	VARCHAR(24) NOT NULL,
    "place_of_invoice" VARCHAR(24) NOT NULL,
    "shop" VARCHAR(24) NOT NULL,
    "type" VARCHAR(24) NOT NULL,
    "warranty_void_at" TIMESTAMP NOT NULL,
    "color" VARCHAR(24)[] NOT NULL,
    "material" VARCHAR(24) NOT NULL,
    "comment" TEXT NOT NULL,
    "pictures" VARCHAR[] NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS "users_drawers" (
    
)