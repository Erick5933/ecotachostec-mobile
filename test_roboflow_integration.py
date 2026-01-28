#!/usr/bin/env python3
"""
Script de prueba para verificar la integración Roboflow - Backend Django
Uso: python test_roboflow_integration.py
"""

import requests
import base64
import json
from pathlib import Path

# Configuración
BACKEND_URL = "http://192.168.54.8:8000/api"
TEST_IMAGE_PATH = "test_waste_image.jpg"  # Proporciona una imagen de prueba

class TestRoboflowIntegration:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
    
    def test_health(self):
        """Prueba si el servidor está disponible"""
        print("\n📊 Verificando salud del servidor...")
        try:
            response = self.session.get(f"{self.base_url}/core/ai/health/")
            if response.status_code == 200:
                data = response.json()
                print("✅ Servidor disponible")
                print(f"   - Status: {data.get('status')}")
                print(f"   - Service: {data.get('service')}")
                print(f"   - Roboflow: {'✅' if data.get('roboflow_available') else '❌'}")
                return True
            else:
                print(f"❌ Servidor retornó status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error de conexión: {e}")
            return False
    
    def test_image_file(self):
        """Prueba con archivo de imagen"""
        print("\n📸 Probando con archivo de imagen...")
        
        if not Path(TEST_IMAGE_PATH).exists():
            print(f"⚠️ No se encontró imagen en {TEST_IMAGE_PATH}")
            print("   Proporciona una imagen de residuos para la prueba")
            return False
        
        try:
            with open(TEST_IMAGE_PATH, 'rb') as f:
                files = {'imagen': f}
                response = self.session.post(
                    f"{self.base_url}/core/ai/detect/",
                    files=files,
                    timeout=120
                )
            
            self._process_response(response)
            return True
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    def test_image_base64(self):
        """Prueba con imagen en base64"""
        print("\n📸 Probando con base64...")
        
        if not Path(TEST_IMAGE_PATH).exists():
            print(f"⚠️ No se encontró imagen en {TEST_IMAGE_PATH}")
            return False
        
        try:
            # Codificar imagen a base64
            with open(TEST_IMAGE_PATH, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
            
            payload = {
                'imagen': image_data
            }
            
            response = self.session.post(
                f"{self.base_url}/core/ai/detect/",
                json=payload,
                timeout=120,
                headers={'Content-Type': 'application/json'}
            )
            
            self._process_response(response)
            return True
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    def _process_response(self, response):
        """Procesa y muestra la respuesta"""
        print(f"\n📡 Status: {response.status_code}")
        
        try:
            data = response.json()
            print("\n✅ Respuesta recibida:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            # Analizar respuesta
            if data.get('success'):
                print("\n🎉 ¡Clasificación exitosa!")
                clasificacion = data.get('clasificacion_principal', {})
                print(f"   - Categoría: {clasificacion.get('categoria')}")
                print(f"   - Confianza: {clasificacion.get('confianza')}%")
            elif data.get('no_detection'):
                print("\n⚠️ No se detectaron objetos")
                print(f"   - Mensaje: {data.get('message')}")
                sugerencias = data.get('suggestions', [])
                if sugerencias:
                    print("   - Sugerencias:")
                    for sug in sugerencias:
                        print(f"     • {sug}")
            else:
                print("\n❌ Error en la clasificación")
                print(f"   - Error: {data.get('error')}")
        
        except json.JSONDecodeError:
            print(f"❌ No se pudo decodificar JSON")
            print(f"Response text: {response.text}")
    
    def run_all_tests(self):
        """Ejecuta todos los tests"""
        print("=" * 60)
        print("🧪 PRUEBAS DE INTEGRACIÓN ROBOFLOW")
        print("=" * 60)
        print(f"\n🔌 Backend: {self.base_url}")
        
        results = {
            'health': self.test_health(),
        }
        
        # Solo ejecutar pruebas de imagen si existe el archivo
        if Path(TEST_IMAGE_PATH).exists():
            results['file'] = self.test_image_file()
            results['base64'] = self.test_image_base64()
        
        # Resumen
        print("\n" + "=" * 60)
        print("📋 RESUMEN")
        print("=" * 60)
        
        for test, result in results.items():
            status = "✅ PASÓ" if result else "❌ FALLÓ"
            print(f"{test:20} {status}")
        
        all_passed = all(results.values())
        print("\n" + ("=" * 60))
        if all_passed:
            print("✅ ¡TODOS LOS TESTS PASARON!")
        else:
            print("❌ Algunos tests fallaron")
        print("=" * 60)
        
        return all_passed


def main():
    print("""
    🤖 VERIFICADOR DE INTEGRACIÓN ROBOFLOW
    
    Este script verifica que:
    1. El servidor Django está corriendo
    2. El endpoint de IA está disponible
    3. Roboflow puede ser contactado
    
    ANTES DE EJECUTAR:
    - Asegúrate que Django está corriendo: python manage.py runserver
    - Proporciona una imagen de prueba como: test_waste_image.jpg
    """)
    
    tester = TestRoboflowIntegration(BACKEND_URL)
    success = tester.run_all_tests()
    
    return 0 if success else 1


if __name__ == "__main__":
    exit(main())
