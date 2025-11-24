-- ================================
-- TABLE : Animal
-- ================================
-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE animal (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL
);

-- ================================
-- TABLE : Type
-- ================================
CREATE TABLE type (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL
);

-- ================================
-- TABLE : Products
-- ================================
CREATE TABLE products (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name       VARCHAR(255) NOT NULL,
        weight     NUMERIC(10,2),
        price      NUMERIC(10,2),
        origin     VARCHAR(255),
        image_url  VARCHAR(512) NOT NULL,
        animal_id  UUID NOT NULL,
        type_id    UUID NOT NULL,

        CONSTRAINT fk_animal
            FOREIGN KEY (animal_id)
                    REFERENCES animal(id)
                    ON DELETE RESTRICT,

        CONSTRAINT fk_type
            FOREIGN KEY (type_id)
                    REFERENCES type(id)
                    ON DELETE RESTRICT
);

-- ================================
-- Seed sample data: fromages, saucissons, pâtés, jambons
-- ================================
WITH a_chevre AS (
    INSERT INTO animal (id, name) VALUES (gen_random_uuid(), 'Chèvre') RETURNING id
), a_vache AS (
    INSERT INTO animal (id, name) VALUES (gen_random_uuid(), 'Vache') RETURNING id
), a_porc AS (
    INSERT INTO animal (id, name) VALUES (gen_random_uuid(), 'Porc') RETURNING id
), t_fromages AS (
    INSERT INTO type (id, name) VALUES (gen_random_uuid(), 'Fromages') RETURNING id
), t_charcuterie AS (
    INSERT INTO type (id, name) VALUES (gen_random_uuid(), 'Charcuterie') RETURNING id
)
INSERT INTO products (id, name, weight, price, origin, image_url, animal_id, type_id)
VALUES
    (gen_random_uuid(), 'Fromage de chèvre frais', 0.25, 6.50, 'Pays de la Loire', 'https://images.unsplash.com/photo-1604908177522-3a6b6f5e3c4f?auto=format&fit=crop&w=800&q=60', (SELECT id FROM a_chevre), (SELECT id FROM t_fromages)),
    (gen_random_uuid(), 'Comté 24 mois', 0.5, 14.00, 'Franche-Comté', 'https://images.unsplash.com/photo-1603011877303-1b7b7c6f6a3d?auto=format&fit=crop&w=800&q=60', (SELECT id FROM a_vache), (SELECT id FROM t_fromages)),
    (gen_random_uuid(), 'Saucisson sec artisanal', 0.3, 8.00, 'Auvergne', 'https://images.unsplash.com/photo-1543353071-087092ec3932?auto=format&fit=crop&w=800&q=60', (SELECT id FROM a_porc), (SELECT id FROM t_charcuterie)),
    (gen_random_uuid(), 'Pâté de campagne', 0.2, 5.00, 'Bourgogne', 'https://images.unsplash.com/photo-1604908177523-2b6b6f5e3c9a?auto=format&fit=crop&w=800&q=60', (SELECT id FROM a_porc), (SELECT id FROM t_charcuterie)),
    (gen_random_uuid(), 'Jambon cru affiné', 0.2, 12.00, 'Sud-Ouest', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=60', (SELECT id FROM a_porc), (SELECT id FROM t_charcuterie));

