-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('MASCULINO', 'FEMENINO');

-- CreateEnum
CREATE TYPE "Objetivo" AS ENUM ('VOLUMEN', 'DEFINICION', 'RECOMPOSICION');

-- CreateEnum
CREATE TYPE "NivelEstres" AS ENUM ('BAJO', 'MEDIO', 'ALTO');

-- CreateEnum
CREATE TYPE "Adherencia" AS ENUM ('BAJA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "EstadoPlan" AS ENUM ('PENDIENTE', 'ACTIVO', 'ARCHIVADO');

-- CreateEnum
CREATE TYPE "Clasificacion" AS ENUM ('VOLUMEN', 'DEFINICION', 'RECOMPOSICION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionalProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "genero" "Genero" NOT NULL,
    "edad" INTEGER NOT NULL,
    "altura" DOUBLE PRECISION NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "objetivo" "Objetivo" NOT NULL,
    "diasEntrenamiento" INTEGER NOT NULL,
    "nivelEstres" "NivelEstres" NOT NULL,
    "horasSueno" DOUBLE PRECISION NOT NULL,
    "adherencia" "Adherencia" NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutritionalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionalPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "estado" "EstadoPlan" NOT NULL DEFAULT 'PENDIENTE',
    "clasificacion" "Clasificacion",
    "calorias" DOUBLE PRECISION,
    "proteina" DOUBLE PRECISION,
    "hidratos" DOUBLE PRECISION,
    "grasas" DOUBLE PRECISION,
    "notasTrainer" TEXT,
    "activadoEn" TIMESTAMP(3),
    "igzClasificacion" "Clasificacion",
    "igzCalorias" DOUBLE PRECISION,
    "igzProteina" DOUBLE PRECISION,
    "igzHidratos" DOUBLE PRECISION,
    "igzGrasas" DOUBLE PRECISION,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutritionalPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionalProfile_userId_key" ON "NutritionalProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionalPlan_userId_key" ON "NutritionalPlan"("userId");

-- AddForeignKey
ALTER TABLE "NutritionalProfile" ADD CONSTRAINT "NutritionalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionalPlan" ADD CONSTRAINT "NutritionalPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
