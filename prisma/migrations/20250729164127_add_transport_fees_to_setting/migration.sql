-- AlterTable
ALTER TABLE `Setting` ADD COLUMN `transportFeeAbove10` DOUBLE NULL,
    ADD COLUMN `transportFeeBelow3` DOUBLE NULL,
    ADD COLUMN `transportFeeBetween3and5` DOUBLE NULL,
    ADD COLUMN `transportFeeBetween5and10` DOUBLE NULL;
