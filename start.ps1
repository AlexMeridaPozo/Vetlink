# Script para iniciar Huellapp en Expo (web/Android/iOS)
# Uso: .\start.ps1          -> abre en web (Chrome)
#      .\start.ps1 android   -> abre en Android
#      .\start.ps1 ios       -> abre en iOS

param(
    [string]$platform = "web"
)

Set-Location $PSScriptRoot

switch ($platform) {
    "android" {
        Write-Host "Iniciando Huellapp en Android..." -ForegroundColor Green
        npx expo start --android
    }
    "ios" {
        Write-Host "Iniciando Huellapp en iOS..." -ForegroundColor Green
        npx expo start --ios
    }
    default {
        Write-Host "Iniciando Huellapp en Web (Chrome)..." -ForegroundColor Green
        npx expo start --web
    }
}

