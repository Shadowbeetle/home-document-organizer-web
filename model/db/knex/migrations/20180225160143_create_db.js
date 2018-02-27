const dedent = require('dedent')

const TABLE_NAME = 'products'

exports.up = function(knex) {
    return knex.schema.hasTable(TABLE_NAME)
    .then((exists) => {
      if (!exists) {
        return knex.raw(dedent`
          CREATE OR REPLACE FUNCTION UPDATE_TIMESTAMP()	
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = now();
            RETURN NEW;	
          END ;$$ 
          LANGUAGE plpgsql VOLATILE
          COST 100;

          CREATE TABLE IF NOT EXISTS "${TABLE_NAME}" (
            "id" SERIAL PRIMARY KEY,
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

          CREATE TRIGGER "SET_UPDATED_AT" BEFORE UPDATE ON "${TABLE_NAME}" FOR EACH ROW EXECUTE PROCEDURE UPDATE_TIMESTAMP();

          CREATE INDEX products_invoice_index on "${TABLE_NAME}" ("invoice_id");
          CREATE INDEX products_place_of_purchase_index on "${TABLE_NAME}" ("place_of_purchase");
          CREATE INDEX products_brand_index on "${TABLE_NAME}" ("brand");
          CREATE INDEX products_class_index on "${TABLE_NAME}" ("class");
          CREATE INDEX products_shop_index on "${TABLE_NAME}" ("shop");
          CREATE INDEX products_type_index on "${TABLE_NAME}" ("type");
          CREATE INDEX products_warranty_void_at_index on "${TABLE_NAME}" ("warranty_void_at");
          CREATE INDEX products_color_index on "${TABLE_NAME}" USING GIN ("color");
        `)
      } else {
        return null
      }
    })
}

exports.down = function(knex) {
  return knex.raw(dedent`
    DROP TABLE IF EXISTS "${TABLE_NAME}";
    DROP FUNCTION IF EXISTS UPDATE_TIMESTAMP;
  `)
}
