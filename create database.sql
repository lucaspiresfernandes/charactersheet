create database charactersheet;

use charactersheet;

CREATE TABLE `player` (
    `player_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    `admin` BOOLEAN NOT NULL,
    PRIMARY KEY (`player_id`)
);

CREATE TABLE `characteristic` (
    `characteristic_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `rollable` BOOLEAN NOT NULL,
    PRIMARY KEY (`characteristic_id`)
);

INSERT INTO `characteristic` (`name`, `rollable`) VALUES ('Força', TRUE);
INSERT INTO `characteristic` (`name`, `rollable`) VALUES ('Destreza', TRUE);
INSERT INTO `characteristic` (`name`, `rollable`) VALUES ('Inteligência', TRUE);
INSERT INTO `characteristic` (`name`, `rollable`) VALUES ('Constituição', TRUE);
INSERT INTO `characteristic` (`name`, `rollable`) VALUES ('Aparência', TRUE);
INSERT INTO `characteristic` (`name`, `rollable`) VALUES ('Poder', TRUE);
INSERT INTO `characteristic` (`name`, `rollable`) VALUES ('Tamanho', TRUE);
INSERT INTO `characteristic` (`name`, `rollable`) VALUES ('Educação', TRUE);
INSERT INTO `characteristic` (`name`, `rollable`) VALUES ('Movimento', FALSE);

CREATE TABLE `player_characteristic` (
    `player_characteristic_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `characteristic_id` INT UNSIGNED NOT NULL,
    `value` bigint NOT NULL,
    PRIMARY KEY (`player_characteristic_id`),
    CONSTRAINT `uk_player_id_characteristic_id` UNIQUE (`player_id`, `characteristic_id`),
    CONSTRAINT `fk_player_characteristic_player_id` FOREIGN KEY (`player_id`) REFERENCES `player`(`player_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_player_characteristic_characteristic_id` FOREIGN KEY (`characteristic_id`) REFERENCES `characteristic`(`characteristic_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `specialization` (
    `specialization_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    PRIMARY KEY (`specialization_id`)
);

INSERT INTO `specialization` (`name`) VALUES ('Armas de Fogo');
INSERT INTO `specialization` (`name`) VALUES ('Arte e Ofício');
INSERT INTO `specialization` (`name`) VALUES ('Ciência');
INSERT INTO `specialization` (`name`) VALUES ('Língua');
INSERT INTO `specialization` (`name`) VALUES ('Lutar');
INSERT INTO `specialization` (`name`) VALUES ('Pilotar');
INSERT INTO `specialization` (`name`) VALUES ('Sobrevivência');

CREATE TABLE `skill` (
    `skill_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `specialization_id` INT UNSIGNED NULL,
    `name` varchar(255) NOT NULL,
    `mandatory` BOOLEAN NOT NULL,
    `start_value` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`skill_id`),
    CONSTRAINT `fk_skill_specialization_id` FOREIGN KEY (`specialization_id`) REFERENCES `specialization`(`specialization_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Antropologia', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (1, 'Arcos', 15, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (1, 'Armas Pesadas', 10, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (1, 'Lança-Chamas', 10, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (1, 'Metralhadoras', 10, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (1, 'Pistolas', 20, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (1, 'Rifles/Espingardas', 25, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (1, 'Submetralhadoras', 15, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Arqueologia', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Arremessar', 20, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (2, 'Atuação', 5, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (2, 'Belas Artes', 5, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (2, 'Criptografia', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (2, 'Falsificação', 5, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (2, 'Fotografia', 5, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Artilharia', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Avaliação', 5, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Cavalgar', 5, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Charme', 15, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Chaveiro', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (3, 'Astronomia', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (3, 'Biologia', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (3, 'Botânica', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (3, 'Ciência Forense', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (3, 'Engenharia', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (3, 'Farmácia', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (3, 'Física', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (3, 'Geologia', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (3, 'Matemática', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (3, 'Meteorologia', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (3, 'Química', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (3, 'Zoologia', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Consertos Elétricos', 10, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Consertos Mecânicos', 10, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Contabilidade', 5, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Demolições', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Direito', 5, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Dirigir Automóveis', 20, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Disfarce', 5, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Eletrônica', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Encontrar', 25, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Escalar', 20, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Escutar', 20, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Esquivar', 0, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Furtividade', 20, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Hipnose', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'História', 5, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Intimidação', 15, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Lábia', 5, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Leitura Labial', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (4, 'Nativa', 0, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (5, 'Briga', 25, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (5, 'Chicotes', 5, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (5, 'Espadas', 20, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (5, 'Garrote', 15, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (5, 'Lanças', 20, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (5, 'Machados', 15, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (5, 'Manguais', 10, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (5, 'Motosserras', 10, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Medicina', 1, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Mergulho', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Mundo Natural', 10, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Natação', 20, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Navegação', 10, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Nível de Crédito', 0, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Ocultismo', 5, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Operar Maquinário Pesado', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Persuasão', 10, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (6, 'Aeronave', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (6, 'Barco', 1, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Prestidigitação', 10, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Primeiros Socorros', 30, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Psicanálise', 1, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Psicologia', 10, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Rastrear', 10, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Saltar', 20, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Treinar Animais', 5, FALSE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Usar Bibliotecas', 20, TRUE);
INSERT INTO `skill` (`specialization_id`, `name`, `start_value`, `mandatory`) VALUES (NULL, 'Usar Computadores', 5, FALSE);

CREATE TABLE `player_skill` (
    `player_skill_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `skill_id` INT UNSIGNED NOT NULL,
    `value` INT NOT NULL,
    `checked` BOOLEAN NOT NULL,
    PRIMARY KEY (`player_skill_id`),
    CONSTRAINT `uk_player_id_skill_id` UNIQUE (`player_id`, `skill_id`),
    CONSTRAINT `fk_player_skill_player_id` FOREIGN KEY (`player_id`) REFERENCES `player`(`player_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_player_skill_skill_id` FOREIGN KEY (`skill_id`) REFERENCES `skill`(`skill_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `attribute` (
    `attribute_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `rollable` BOOLEAN NOT NULL,
    `bg_color` varchar(6) NOT NULL,
    `fill_color` varchar(6) NOT NULL,
    PRIMARY KEY (`attribute_id`)
);

INSERT INTO `attribute` (`name`, `rollable`, `bg_color`, `fill_color`) VALUES ('Vida', 0, '5a1e1e', 'b62323');
INSERT INTO `attribute` (`name`, `rollable`, `bg_color`, `fill_color`) VALUES ('Armadura', 0, '916b03', 'ffbb00');
INSERT INTO `attribute` (`name`, `rollable`, `bg_color`, `fill_color`) VALUES ('Sanidade', 1, '2c4470', '1f3ce0');
INSERT INTO `attribute` (`name`, `rollable`, `bg_color`, `fill_color`) VALUES ('Magia', 0, '682f5b', 'ae00ff');

CREATE TABLE `attribute_status` (
    `attribute_status_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `attribute_id` INT UNSIGNED NOT NULL,
    `name` varchar(255) NOT NULL,
    PRIMARY KEY (`attribute_status_id`),
    CONSTRAINT `fk_attribute_status_attribute_id` FOREIGN KEY (`attribute_id`) REFERENCES `attribute`(`attribute_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO `attribute_status` (`name`, `attribute_id`) VALUES ('Inconsciente', 1);
INSERT INTO `attribute_status` (`name`, `attribute_id`) VALUES ('Ferimento Grave', 1);
INSERT INTO `attribute_status` (`name`, `attribute_id`) VALUES ('Traumatizado', 3);
INSERT INTO `attribute_status` (`name`, `attribute_id`) VALUES ('Enlouquecido', 3);

CREATE TABLE `player_attribute` (
    `player_attribute_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `attribute_id` INT UNSIGNED NOT NULL,
    `value` INT NOT NULL,
    `max_value` INT NOT NULL,
    PRIMARY KEY (`player_attribute_id`),
    CONSTRAINT `uk_player_id_attribute_id` UNIQUE (`player_id`, `attribute_id`),
    CONSTRAINT `fk_player_attribute_player_id` FOREIGN KEY (`player_id`) REFERENCES `player`(`player_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_player_attribute_attribute_id` FOREIGN KEY (`attribute_id`) REFERENCES `attribute`(`attribute_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `player_attribute_status` (
    `player_attribute_status_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `attribute_status_id` INT UNSIGNED NOT NULL,
    `value` BOOLEAN NOT NULL,
    PRIMARY KEY (`player_attribute_status_id`),
    CONSTRAINT `uk_player_id_attribute_status_id` UNIQUE (`player_id`, `attribute_status_id`),
    CONSTRAINT `fk_player_attribute_status_player_id` FOREIGN KEY (`player_id`) REFERENCES `player`(`player_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_player_attribute_status_attribute_status_id` FOREIGN KEY (`attribute_status_id`) REFERENCES `attribute_status`(`attribute_status_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `equipment` (
    `equipment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `skill_id` INT UNSIGNED NOT NULL,
    `damage` varchar(255) NOT NULL,
    `range` varchar(255) NOT NULL,
    `attacks` varchar(255) NOT NULL,
    `ammo` varchar(255) NOT NULL,
    `malfunc` varchar(10) NOT NULL,
    PRIMARY KEY (`equipment_id`),
    CONSTRAINT `fk_equipment_skill_id` FOREIGN KEY (`skill_id`) REFERENCES `skill` (`skill_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO `equipment` (`name`, `skill_id`, `damage`, `range`, `attacks`, `ammo`, `malfunc`) VALUES 
#-- Corpo-a-Corpo.
('Desarmado', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Briga'), '1d3+DB', 'Toque', '1', '-', '-'),
('Soqueira', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Briga'), '1d3+1+DB', 'Toque', '1', '-', '-'),
('Tocha Acesa (Queimar)', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Briga'), '1d6', '3 metros', '1', '-', '-'),
('Cassetete', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Briga'), '1d8+DB', 'Toque', '1', '-', '-'),
('Bastão Grande', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Briga'), '1d8+DB', 'Toque', '1', '-', '-'),
('Bastão Pequeno', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Briga'), '1d6+DB', 'Toque', '1', '-', '-'),
('Faca Grande', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Briga'), '1d8+DB', 'Toque', '1', '-', '-'),
('Faca Média', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Briga'), '1d4+2+DB', 'Toque', '1', '-', '-'),
('Faca Pequena', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Briga'), '1d4+DB', 'Toque', '1', '-', '-'),
('Spray de Pimenta (Atordoar)', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Briga'), '1d4+DB', '2 metros', '1', '25', '-'),
('Taser (Atordoar)', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Briga'), '1d3', 'Toque', '1', '-', '-'),
('Taser (Dardo) (Atordoar)', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Pistolas'), '1d3', '5 metros', '1', '3', '-'),
('Lança Grande', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Lanças'), '1d8+1', 'Toque', '1', '-', '-'),
('Espada Pesada', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Espadas'), '1d8+1+DB', 'Toque', '1', '-', '-'),
('Espada Média', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Espadas'), '1d6+1+DB', 'Toque', '1', '-', '-'),
('Espada Leve', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Espadas'), '1d6+DB', 'Toque', '1', '-', '-'),
('Garrote', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Garrote'), '1d6+DB', 'Toque', '1', '-', '-'),
('Machadinha', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Machados'), '1d6+1+DB', 'Toque', '1', '-', '-'),
('Machado Grande', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Machados'), '1d8+2+DB', 'Toque', '1', '-', '-'),
('Serra Elétrica', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Motosserras'), '2d8', 'Toque', '1', '-', '-'),
('Chicote', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Chicotes'), '1d3+DB/2', '3 metros', '1', '-', '-'),
('Nunchaku', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Manguais'), '1d8+DB', 'Toque', '1', '-', '-'),
#-- Pistolas e Arcos
('Arco e Flecha', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Arcos'), '1d6+DB/2', '30 metros', '1', '1', '97'),
('Besta', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Arcos'), '1d8+2', '50 metros', '1', '1', '96'),
('Revólver .41', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Pistolas'), '1d10', '20 metros', '1(3)', '8', '100'),
('Revolver .44', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Pistolas'), '1d10+1d4+2', '15 metros', '1(3)', '6', '100'),
('Revólver .45', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Pistolas'), '1d10+2', '13 metros', '1(3)', '6', '100'),
('Glock 9mm', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Pistolas'), '1d10', '15 metros', '1(3)', '17', '98'),
('IME Desert Eagle', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Pistolas'), '1d10+1d6+3', '20 metros', '1(3)', '7', '94'),
#-- Rifles e Espingardas
('Barrett Model 82', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Rifles/Espingardas'), '2d10+1d8+6', '250 metros', '1', '11', '96'),
('Carabina de Alavanca .30', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Rifles/Espingardas'), '2d6', '50 metros', '1', '6', '98'),
('Rifle Martini-Henry .45', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Rifles/Espingardas'), '1D8+1D6+3', '80 metros', '1', '1', '100'),
('Carabina SKS', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Rifles/Espingardas'), '2D6+1', '90 metros', '1(2)', '10', '97'),
('Rifle Marlin .444', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Rifles/Espingardas'), '2D8+4', '110 metros', '1', '5', '98'),
('Espingarda cal. 20', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Rifles/Espingardas'), '2d6/1d6/1d3', '10/20/50 metros', '1(2)', '2', '100'),
('Espingarda cal. 16', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Rifles/Espingardas'), '2d6+2/1d6+1/1d4', '10/20/50 metros', '1(2)', '2', '100'),
('Espingarda cal. 12 (Semi)', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Rifles/Espingardas'), '4d6/2d6/1d6', '10/20/50 metros', '1(2)', '5', '100'),
('Escopeta Serrada cal. 12', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Rifles/Espingardas'), '4d6/1d6', '5/10 metros', '1(2)', '2', '100'),
('Benelli M3 cal. 12', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Rifles/Espingardas'), '4d6/2d6/1d6', '10/20/50 metros', '1(2)', '7', '100'),
#-- Fuzis de Assalto
('AK-47', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Rifles/Espingardas'), '2d6+1', '100 metros', '1(2)/Auto', '30', '100'),
('AK-74', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Rifles/Espingardas'), '2d6', '110 metros', '1(2)/Auto', '30', '97'),
('M16A2', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Rifles/Espingardas'), '2d6', '110 metros', '1(2)/Rajada', '30', '97'),
('M4', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Rifles/Espingardas'), '2d6', '90 metros', '1/Rajada', '30', '97'),
('FN FAL', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Rifles/Espingardas'), '2d6+4', '110 metros', '1(2)/Rajada', '20', '97'),
('Steyr AUG', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Rifles/Espingardas'), '2d6', '110 metros', '1(2)/Auto', '30', '99'),
#--Submetralhadoras
('Thompson (20)', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Submetralhadoras'), '1d10 + 2', '20 metros', '1/Auto', '20', '96'),
('Thompson (30)', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Submetralhadoras'), '1d10 + 2', '20 metros', '1/Auto', '30', '96'),
('Thompson (50)', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Submetralhadoras'), '1d10 + 2', '20 metros', '1/Auto', '50', '96'),
('UZI', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Submetralhadoras'), '1d10', '20 metros', '1(2)/Auto', '32', '98'),
('Skorpion', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Submetralhadoras'), '1d8', '15 metros', '1(3)/Auto', '20', '96'),
#--Metralhadoras
('Gatling Gun 1882', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Metralhadoras'), '2d6+4', '100 metros', 'Auto', '200', '96'),
('Browning Auto Rifle M1918', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Metralhadoras'), '2d6+4', '90 metros', '1(2)/Auto', '20', '100'),
('Browning M1917A1 .30', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Metralhadoras'), '2d6+4', '150 metros', 'Auto', '250', '96'),
('FN Minimi 5.56mm (30)', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Metralhadoras'), '2d6', '110 metros', 'Auto', '30', '99'),
('FN Minimi 5.56mm (200)', (SELECT `skill_id` FROM `skill` WHERE `name` = 'Metralhadoras'), '2d6', '110 metros', 'Auto', '200', '99');

CREATE TABLE `player_equipment` (
    `player_equipment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `equipment_id` INT UNSIGNED NOT NULL,
    `current_ammo` varchar(255) NOT NULL,
    `using` BOOLEAN NOT NULL,
    PRIMARY KEY (`player_equipment_id`),
    CONSTRAINT `uk_player_id_equipment_id` UNIQUE (`player_id`, `equipment_id`),
    CONSTRAINT `fk_player_equipment_player_id` FOREIGN KEY (`player_id`) REFERENCES `player`(`player_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_player_equipment_equipment_id` FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`equipment_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `spec` (
    `spec_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    PRIMARY KEY (`spec_id`)
);

INSERT INTO `spec` (`name`) VALUES ('Dano Bônus');
INSERT INTO `spec` (`name`) VALUES ('Corpo');
INSERT INTO `spec` (`name`) VALUES ('Exposição Paranormal');

CREATE TABLE `player_spec` (
    `player_spec_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `spec_id` INT UNSIGNED NOT NULL,
    `value` varchar(255) NOT NULL,
    PRIMARY KEY (`player_spec_id`),
    CONSTRAINT `uk_player_id_spec_id` UNIQUE (`player_id`, `spec_id`),
    CONSTRAINT `fk_player_spec_player_id` FOREIGN KEY (`player_id`) REFERENCES `player`(`player_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_player_spec_spec_id` FOREIGN KEY (`spec_id`) REFERENCES `spec`(`spec_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `item` (
    `item_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `description` MEDIUMTEXT NOT NULL,
    PRIMARY KEY (`item_id`)
);

INSERT INTO `item` (`name`, `description`) VALUES ('Chapa de Identificação', 'Uma chapa de identificação militar.'),
('Vestimentas', 'Descreva suas vestimentas aqui.'),
('Celular', 'Um celular comum.'),
('Isqueiro', 'Um isqueiro comum.'),
('Mochila', 'Uma mochila comum. Descreva aqui seu tamanho e sua capacidade.'),
('Maleta', 'Uma maleta comum. Descreva aqui seu tamanho e sua capacidade.'),
('Mala', 'Uma mala comum. Descreva aqui seu tamanho e sua capacidade.'),
('Bolsa', 'Uma bolsa comum. Descreva aqui seu tamanho e sua capacidade.'),
('Relógio', 'Um relógio comum.'),
('Carteira', 'Uma carteira comum.'),
('Livro', 'Um livro comum. Descreva aqui o conteúdo do livro.'),
('Livro de Ocultismo', 'Um livro de ocultismo. Descreva aqui seu conteúdo.'),
('Kit Médico', 'Um kit médico que garante vantagem em Primeiros Socorros/Medicina no uso.');

CREATE TABLE `player_item` (
    `player_item_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `item_id` INT UNSIGNED NOT NULL,
    `description` MEDIUMTEXT NOT NULL,
    PRIMARY KEY (`player_item_id`),
    CONSTRAINT `uk_player_id_item_id` UNIQUE (`player_id`, `item_id`),
    CONSTRAINT `fk_player_item_player_id` FOREIGN KEY (`player_id`) REFERENCES `player`(`player_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_player_item_item_id` FOREIGN KEY (`item_id`) REFERENCES `item`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `info` (
    `info_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    PRIMARY KEY (`info_id`)
);

INSERT INTO `info` (`name`) VALUES ('Nome');
INSERT INTO `info` (`name`) VALUES ('Player');
INSERT INTO `info` (`name`) VALUES ('Ocupação');
INSERT INTO `info` (`name`) VALUES ('Idade');
INSERT INTO `info` (`name`) VALUES ('Sexo');
INSERT INTO `info` (`name`) VALUES ('Residência');
INSERT INTO `info` (`name`) VALUES ('Local de Nascimento');
INSERT INTO `info` (`name`) VALUES ('Peso');
INSERT INTO `info` (`name`) VALUES ('Altura');

CREATE TABLE `player_info` (
    `player_info_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `info_id` INT UNSIGNED NOT NULL,
    `value` MEDIUMTEXT NOT NULL,
    PRIMARY KEY (`player_info_id`),
    CONSTRAINT `uk_player_id_info_id` UNIQUE (`player_id`, `info_id`),
    CONSTRAINT `fk_player_info_player_id` FOREIGN KEY (`player_id`) REFERENCES `player`(`player_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_player_info_info_id` FOREIGN KEY (`info_id`) REFERENCES `info`(`info_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `extra_info` (
    `extra_info_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    PRIMARY KEY (`extra_info_id`)
);

INSERT INTO `extra_info` (`name`) VALUES ('Patrimônio e Posses');
INSERT INTO `extra_info` (`name`) VALUES ('Magias');
INSERT INTO `extra_info` (`name`) VALUES ('Personalidade');
INSERT INTO `extra_info` (`name`) VALUES ('Backstory');
INSERT INTO `extra_info` (`name`) VALUES ('Itens, Pessoas e Locais Importantes');
INSERT INTO `extra_info` (`name`) VALUES ('Fobias e Manias');
INSERT INTO `extra_info` (`name`) VALUES ('Notas');

CREATE TABLE `player_extra_info` (
    `player_extra_info_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `extra_info_id` INT UNSIGNED NOT NULL,
    `value` MEDIUMTEXT NOT NULL,
    PRIMARY KEY (`player_extra_info_id`),
    CONSTRAINT `uk_player_id_extra_info_id` UNIQUE (`player_id`, `extra_info_id`),
    CONSTRAINT `fk_player_extra_info_player_id` FOREIGN KEY (`player_id`) REFERENCES `player`(`player_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_player_extra_info_extra_info_id` FOREIGN KEY (`extra_info_id`) REFERENCES `extra_info`(`extra_info_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `finance` (
    `finance_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    PRIMARY KEY (`finance_id`)
);

INSERT INTO `finance` (`name`) VALUES ('Nível de Gasto Diário');
INSERT INTO `finance` (`name`) VALUES ('Dinheiro');

CREATE TABLE `player_finance` (
    `player_finance_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `finance_id` INT UNSIGNED NOT NULL,
    `value` MEDIUMTEXT NOT NULL,
    PRIMARY KEY (`player_finance_id`),
    CONSTRAINT `uk_player_id_finance_id` UNIQUE (`player_id`, `finance_id`),
    CONSTRAINT `fk_player_finance_player_id` FOREIGN KEY (`player_id`) REFERENCES `player`(`player_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_player_finance_finance_id` FOREIGN KEY (`finance_id`) REFERENCES `finance`(`finance_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `avatar` (
    `avatar_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    PRIMARY KEY (`avatar_id`)
);

INSERT INTO `avatar` (`name`) VALUES ('Padrão');
INSERT INTO `avatar` (`name`) VALUES ('Inconsciente');
INSERT INTO `avatar` (`name`) VALUES ('Ferido');
INSERT INTO `avatar` (`name`) VALUES ('Louco');
INSERT INTO `avatar` (`name`) VALUES ('Ferido e Louco');

CREATE TABLE `player_avatar` (
    `player_avatar_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `avatar_id` INT UNSIGNED NOT NULL,
    `link` MEDIUMTEXT NULL,
    PRIMARY KEY (`player_avatar_id`),
    CONSTRAINT `uk_player_id_avatar_id` UNIQUE (`player_id`, `avatar_id`),
    CONSTRAINT `fk_player_avatar_player_id` FOREIGN KEY (`player_id`) REFERENCES `player`(`player_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_player_avatar_avatar_id` FOREIGN KEY (`avatar_id`) REFERENCES `avatar`(`avatar_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `admin_key`
(
    `key` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`key`)
);

INSERT INTO `admin_key` (`key`) VALUES (123456);

create table `admin_note` (
    `admin_note_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `admin_id` INT UNSIGNED NOT NULL,
    `value` MEDIUMTEXT NOT NULL,
    PRIMARY KEY (`admin_note_id`),
    CONSTRAINT `fk_admin_note_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `player`(`player_id`) ON DELETE CASCADE ON UPDATE CASCADE
);