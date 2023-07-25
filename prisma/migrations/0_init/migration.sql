-- CreateTable
CREATE TABLE `admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NOT NULL,
    `email` TEXT NOT NULL,
    `password` TEXT NOT NULL,
    `region_id` INTEGER NULL,

    INDEX `admin_region_id_fk`(`region_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `region_id` INTEGER NULL,
    `admin_id` INTEGER NULL,
    `name` TEXT NOT NULL,
    `address` TEXT NOT NULL,
    `location` TEXT NULL,
    `remark` TEXT NULL,
    `birthdate` DATETIME(0) NOT NULL,
    `checkdate` DATETIME(0) NOT NULL,

    INDEX `client_admin_id_fk`(`admin_id`),
    INDEX `client_region_id_fk`(`region_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `region` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin` ADD CONSTRAINT `admin_region_id_fk` FOREIGN KEY (`region_id`) REFERENCES `region`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `client` ADD CONSTRAINT `client_admin_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `admin`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `client` ADD CONSTRAINT `client_region_id_fk` FOREIGN KEY (`region_id`) REFERENCES `region`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

