-- ================================
-- TABLE : Animal
-- ================================
CREATE TABLE animal (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- ================================
-- TABLE : Type
-- ================================
CREATE TABLE type (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- ================================
-- TABLE : Products
-- ================================
CREATE TABLE products (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    weight     NUMERIC(10,2),
    price      NUMERIC(10,2),
    origin     VARCHAR(255),
    image_url  VARCHAR(512) NOT NULL,
    animal_id  INTEGER NOT NULL,
    type_id    INTEGER NOT NULL,

    CONSTRAINT fk_animal
      FOREIGN KEY (animal_id)
          REFERENCES animal(id)
          ON DELETE RESTRICT,

    CONSTRAINT fk_type
      FOREIGN KEY (type_id)
          REFERENCES type(id)
          ON DELETE RESTRICT
);