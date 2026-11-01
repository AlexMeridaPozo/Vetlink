# Script para iniciar Vetlink en Expo (web/Android/iOS)
# Uso: .\start.ps1          -> abre en web (Chrome)
#      .\start.ps1 android   -> abre en Android
#      .\start.ps1 ios       -> abre en iOS

param(
    [string]$platform = "web"
)

Set-Location $PSScriptRoot

switch ($platform) {
    "android" {
        Write-Host "Iniciando Vetlink en Android..." -ForegroundColor Green
        pnpm expo start --android
    }
    "ios" {
        Write-Host "Iniciando Vetlink en iOS..." -ForegroundColor Green
        pnpm expo start --ios
    }
    default {
        Write-Host "Iniciando Vetlink en Web (Chrome)..." -ForegroundColor Green
        pnpm expo start --web
    }
}

