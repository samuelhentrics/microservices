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
), t_saucissons AS (
    INSERT INTO type (id, name) VALUES (gen_random_uuid(), 'Saucissons') RETURNING id
), t_pates AS (
    INSERT INTO type (id, name) VALUES (gen_random_uuid(), 'Pâtés') RETURNING id
), t_jambons AS (
    INSERT INTO type (id, name) VALUES (gen_random_uuid(), 'Jambons') RETURNING id
)

INSERT INTO products (id, name, weight, price, origin, image_url, animal_id, type_id)
VALUES
    -- FROMAGES
    (gen_random_uuid(), 'Fromage de chèvre frais', 0.25, 6.50, 'Pays de la Loire', 'https://www.fromagesdechevre.com/wp-content/uploads/2015/08/Banon-AOP1-320x230.jpg', (SELECT id FROM a_chevre), (SELECT id FROM t_fromages)),
    (gen_random_uuid(), 'Comté 24 mois', 0.5, 14.00, 'Franche-Comté', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrlJhH-4-YOyPCkD93ecJheudNz3PZRgK3Tg&s', (SELECT id FROM a_vache), (SELECT id FROM t_fromages)),
    (gen_random_uuid(), 'Tomme de Savoie', 0.4, 9.80, 'Savoie', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTix0RshUPxqEePkrsaoWwFTIIbAUdk3BhDt7Lrf7ZHEW1kpyUEZZWz_lNLJMvw335tIzn_t-vKuzUS9vf3YNzaK2LVUKaOauYa3uH70SIX', (SELECT id FROM a_vache), (SELECT id FROM t_fromages)),
    (gen_random_uuid(), 'Chabichou du Poitou', 0.15, 5.90, 'Nouvelle-Aquitaine', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4u1tsFmeftJYDvSy76nRgAz7IEXhHjXNPr191qfxKGG4r1nYOcW0bewJ6XNW1fjeAAELJdfDYbpacps-G5WdazjxiyiusCzpmteLStzI&s=10', (SELECT id FROM a_chevre), (SELECT id FROM t_fromages)),

    -- SAUCISSONS
    (gen_random_uuid(), 'Saucisson sec artisanal', 0.3, 8.00, 'Auvergne', 'https://selectiondugout.fr/wp-content/uploads/2021/01/saucisson-sec-artisanal-aveyron.jpg', (SELECT id FROM a_porc), (SELECT id FROM t_saucissons)),
    (gen_random_uuid(), 'Rosette de Lyon', 0.35, 9.50, 'Lyon', 'https://www.cremeriedeschamps.com/wp-content/uploads/2021/03/175.jpg', (SELECT id FROM a_porc), (SELECT id FROM t_saucissons)),
    (gen_random_uuid(), 'Saucisson aux noisettes', 0.3, 8.90, 'Rhône-Alpes', 'https://saveursdesterroirs.net/wp-content/uploads/2018/11/saucisson-aux-noisettes-1.jpg', (SELECT id FROM a_porc), (SELECT id FROM t_saucissons)),

    -- PÂTÉS
    (gen_random_uuid(), 'Pâté de campagne', 0.2, 5.00, 'Bourgogne', 'https://www.coopchezvous.com/img/recipe/262.webp', (SELECT id FROM a_porc), (SELECT id FROM t_pates)),
    (gen_random_uuid(), 'Pâté de foie traditionnel', 0.18, 4.50, 'Occitanie', 'https://www.giallozafferano.fr/images/33-3333/pate-di-fegato_1200x800.jpg', (SELECT id FROM a_porc), (SELECT id FROM t_pates)),
    (gen_random_uuid(), 'Terrine de campagne aux herbes', 0.25, 6.20, 'Normandie', 'https://www.charcuterie-costa.com/images/virtuemart/product/DSC_1539-Modifier.jpg', (SELECT id FROM a_porc), (SELECT id FROM t_pates)),

    -- JAMBONS
    (gen_random_uuid(), 'Jambon cru affiné', 0.2, 12.00, 'Sud-Ouest', 'https://cdn-ojecgf.nitrocdn.com/ItEMbsNNbdpJnWfmqSobuZHtdDJOrItE/assets/images/optimized/rev-6c31945/salumipasini.com/wp-content/uploads/2025/06/Prosciutto-Crudo-vaschetta-SE01V3-mood2-2.jpg', (SELECT id FROM a_porc), (SELECT id FROM t_jambons)),
    (gen_random_uuid(), 'Jambon de Bayonne', 0.22, 13.50, 'Pays Basque', 'https://lahouratate.com/cdn/shop/files/Bayonne-paysage_2681d299-2049-4880-8ab0-ffd26bfeb7b9.jpg?v=1744279364&width=480', (SELECT id FROM a_porc), (SELECT id FROM t_jambons)),
    (gen_random_uuid(), 'Jambon blanc supérieur', 0.18, 6.90, 'France', 'https://cdn.auchan.fr/media/A0220151119000013714PRIMARY_2048x2048/B2CD/', (SELECT id FROM a_porc), (SELECT id FROM t_jambons));
