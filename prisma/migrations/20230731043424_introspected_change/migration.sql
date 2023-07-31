-- CreateTable
CREATE TABLE `authority` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_super` BOOLEAN NOT NULL,
    `is_admin` BOOLEAN NOT NULL,
    `is_user` BOOLEAN NOT NULL,
    `admin_id` INTEGER NULL,

    INDEX `authority_admin_id_fk`(`admin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `authority` ADD CONSTRAINT `authority_admin_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `admin`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
