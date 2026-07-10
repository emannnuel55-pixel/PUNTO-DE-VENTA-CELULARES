-- Initial migration for PUNTO DE VENTA CELULARES
CREATE TYPE "Role" AS ENUM ('OWNER','ADMIN','MANAGER','RECEPTION','TECHNICIAN','SALES','WAREHOUSE','FINANCE','AUDITOR');
CREATE TYPE "RepairStatus" AS ENUM ('RECEIVED','PENDING_DIAGNOSIS','DIAGNOSING','WAITING_ESTIMATE','ESTIMATE_SENT','WAITING_CUSTOMER_APPROVAL','AUTHORIZED','NOT_AUTHORIZED','WAITING_PART','PART_AVAILABLE','REPAIRING','TESTING','COMPLETED','NOT_VIABLE','PAYMENT_PENDING','READY_FOR_DELIVERY','DELIVERED','WARRANTY','CANCELLED','ABANDONED');
CREATE TYPE "EstimateStatus" AS ENUM ('PENDING','ACCEPTED','REJECTED','SUPERSEDED');
CREATE TYPE "MessageSenderType" AS ENUM ('EMPLOYEE','CUSTOMER','SYSTEM');
CREATE TYPE "InventoryMovementType" AS ENUM ('INITIAL','PURCHASE','SALE','REPAIR_USE','ADJUSTMENT','RETURN','TRANSFER_IN','TRANSFER_OUT');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH','TRANSFER','CARD_TERMINAL','DIGITAL');

CREATE TABLE "Branch" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "address" TEXT,
  "phone" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "branchId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId","expiresAt");

CREATE TABLE "Customer" (
  "id" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "alternatePhone" TEXT,
  "email" TEXT,
  "address" TEXT,
  "city" TEXT,
  "preferredContact" TEXT NOT NULL DEFAULT 'WHATSAPP',
  "privacyAccepted" BOOLEAN NOT NULL DEFAULT false,
  "privacyVersion" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

CREATE TABLE "Device" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "color" TEXT,
  "serialNumber" TEXT,
  "imei" TEXT,
  "capacity" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Device_customerId_idx" ON "Device"("customerId");
CREATE INDEX "Device_serialNumber_idx" ON "Device"("serialNumber");
CREATE INDEX "Device_imei_idx" ON "Device"("imei");

CREATE TABLE "RepairOrder" (
  "id" TEXT NOT NULL,
  "publicFolio" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "deviceId" TEXT NOT NULL,
  "receivedById" TEXT NOT NULL,
  "technicianId" TEXT,
  "status" "RepairStatus" NOT NULL DEFAULT 'RECEIVED',
  "issue" TEXT NOT NULL,
  "physicalCondition" TEXT,
  "accessories" TEXT,
  "diagnosis" TEXT,
  "initialEstimate" DECIMAL(12,2) NOT NULL,
  "deposit" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "promisedAt" TIMESTAMP(3),
  "priority" INTEGER NOT NULL DEFAULT 2,
  "accessCodeHash" TEXT NOT NULL,
  "accessCodeLookup" TEXT NOT NULL,
  "accessCodeLast4" TEXT NOT NULL,
  "accessCodeRevokedAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RepairOrder_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RepairOrder_publicFolio_key" ON "RepairOrder"("publicFolio");
CREATE UNIQUE INDEX "RepairOrder_accessCodeLookup_key" ON "RepairOrder"("accessCodeLookup");
CREATE INDEX "RepairOrder_customerId_status_idx" ON "RepairOrder"("customerId","status");
CREATE INDEX "RepairOrder_technicianId_status_idx" ON "RepairOrder"("technicianId","status");
CREATE INDEX "RepairOrder_branchId_createdAt_idx" ON "RepairOrder"("branchId","createdAt");

CREATE TABLE "RepairUpdate" (
  "id" TEXT NOT NULL,
  "repairOrderId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "previousStatus" "RepairStatus",
  "newStatus" "RepairStatus" NOT NULL,
  "comment" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "visibleToCustomer" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RepairUpdate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RepairUpdate_repairOrderId_sequence_key" ON "RepairUpdate"("repairOrderId","sequence");
CREATE INDEX "RepairUpdate_repairOrderId_createdAt_idx" ON "RepairUpdate"("repairOrderId","createdAt");

CREATE TABLE "Estimate" (
  "id" TEXT NOT NULL,
  "repairOrderId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "partsAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "laborAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "totalAmount" DECIMAL(12,2) NOT NULL,
  "status" "EstimateStatus" NOT NULL DEFAULT 'PENDING',
  "customerDecisionAt" TIMESTAMP(3),
  "customerDecisionIp" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Estimate_repairOrderId_version_key" ON "Estimate"("repairOrderId","version");
CREATE INDEX "Estimate_repairOrderId_status_idx" ON "Estimate"("repairOrderId","status");

CREATE TABLE "Message" (
  "id" TEXT NOT NULL,
  "repairOrderId" TEXT NOT NULL,
  "senderType" "MessageSenderType" NOT NULL,
  "senderUserId" TEXT,
  "body" TEXT NOT NULL,
  "visibleToCustomer" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "editedAt" TIMESTAMP(3),
  CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Message_repairOrderId_createdAt_idx" ON "Message"("repairOrderId","createdAt");

CREATE TABLE "ClientSession" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "repairOrderId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClientSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClientSession_tokenHash_key" ON "ClientSession"("tokenHash");
CREATE INDEX "ClientSession_repairOrderId_expiresAt_idx" ON "ClientSession"("repairOrderId","expiresAt");

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "barcode" TEXT,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "brand" TEXT,
  "compatibleModels" TEXT,
  "cost" DECIMAL(12,2) NOT NULL,
  "price" DECIMAL(12,2) NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "minimumStock" INTEGER NOT NULL DEFAULT 1,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");
CREATE INDEX "Product_branchId_active_idx" ON "Product"("branchId","active");
CREATE INDEX "Product_category_idx" ON "Product"("category");

CREATE TABLE "InventoryMovement" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "type" "InventoryMovementType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "previousStock" INTEGER NOT NULL,
  "newStock" INTEGER NOT NULL,
  "reference" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "InventoryMovement_productId_createdAt_idx" ON "InventoryMovement"("productId","createdAt");

CREATE TABLE "Sale" (
  "id" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "customerId" TEXT,
  "userId" TEXT NOT NULL,
  "subtotal" DECIMAL(12,2) NOT NULL,
  "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Sale_folio_key" ON "Sale"("folio");
CREATE UNIQUE INDEX "Sale_idempotencyKey_key" ON "Sale"("idempotencyKey");
CREATE INDEX "Sale_branchId_createdAt_idx" ON "Sale"("branchId","createdAt");

CREATE TABLE "SaleItem" (
  "id" TEXT NOT NULL,
  "saleId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" DECIMAL(12,2) NOT NULL,
  "total" DECIMAL(12,2) NOT NULL,
  CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "saleId" TEXT NOT NULL,
  "method" "PaymentMethod" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "reference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorUserId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "result" TEXT NOT NULL DEFAULT 'SUCCESS',
  "metadata" JSONB,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId","createdAt");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType","entityId");

CREATE TABLE "SystemSetting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");


CREATE TABLE "AccessAttempt" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "blockedUntil" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccessAttempt_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AccessAttempt_key_key" ON "AccessAttempt"("key");

ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Device" ADD CONSTRAINT "Device_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RepairOrder" ADD CONSTRAINT "RepairOrder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RepairOrder" ADD CONSTRAINT "RepairOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RepairOrder" ADD CONSTRAINT "RepairOrder_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RepairOrder" ADD CONSTRAINT "RepairOrder_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RepairOrder" ADD CONSTRAINT "RepairOrder_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RepairUpdate" ADD CONSTRAINT "RepairUpdate_repairOrderId_fkey" FOREIGN KEY ("repairOrderId") REFERENCES "RepairOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RepairUpdate" ADD CONSTRAINT "RepairUpdate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_repairOrderId_fkey" FOREIGN KEY ("repairOrderId") REFERENCES "RepairOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_repairOrderId_fkey" FOREIGN KEY ("repairOrderId") REFERENCES "RepairOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClientSession" ADD CONSTRAINT "ClientSession_repairOrderId_fkey" FOREIGN KEY ("repairOrderId") REFERENCES "RepairOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
