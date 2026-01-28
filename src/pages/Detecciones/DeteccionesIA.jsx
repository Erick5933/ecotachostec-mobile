import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { detectWasteWithAI, CATEGORY_INFO } from "../../api/deteccionIAApi";

export default function DeteccionesIA() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('back');
  
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const scrollViewRef = useRef(null);

  const startCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permiso Denegado", "Se necesita acceso a la cámara");
        return;
      }
    }
    setShowCamera(true);
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        
        const imageData = `data:image/jpeg;base64,${photo.base64}`;
        setCapturedImage(imageData);
        setShowCamera(false);
        setResult(null);
      } catch (error) {
        console.error("Error capturando foto:", error);
        Alert.alert("Error", "No se pudo capturar la foto");
      }
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permiso Denegado", "Se necesita acceso a la galería");
      return;
    }

    try {
      const mediaTypesOption = ImagePicker?.MediaTypeOptions?.Images ?? ImagePicker?.MediaType?.Images;
      const pickerOptions = { allowsEditing: false, quality: 0.8, base64: true };
      if (mediaTypesOption) pickerOptions.mediaTypes = mediaTypesOption;

      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

      const cancelled = result.canceled ?? result.cancelled;
      if (cancelled) return;

      const asset = result.assets?.[0] || result;
      if (!asset) return;

      if (asset.base64) {
        const mime = asset.type || 'image/jpeg';
        const imageData = `data:${mime};base64,${asset.base64}`;
        setCapturedImage(imageData);
        setResult(null);
        setShowCamera(false);
        return;
      }

      if (asset.uri) {
        try {
          const fileBase64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
          const imageData = `data:image/jpeg;base64,${fileBase64}`;
          setCapturedImage(imageData);
          setResult(null);
          setShowCamera(false);
        } catch (fsErr) {
          console.error('Error leyendo archivo de galería:', fsErr);
          Alert.alert('Error', 'No se pudo procesar la imagen seleccionada');
        }
      }
    } catch (err) {
      console.error('Error al abrir la galería:', err);
      Alert.alert('Error', 'No se pudo abrir la galería de imágenes');
    }
  };

  const handleAnalyze = async () => {
    if (!capturedImage) {
      Alert.alert("Error", "No hay imagen para analizar");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await detectWasteWithAI(capturedImage);

      if (!response.success && response.error) {
        Alert.alert("Error", response.error);
        return;
      }

      if (!response.success && response.no_detection) {
        setResult({
          no_detection: true,
          message: response.message,
          suggestions: response.suggestions || []
        });
        scrollViewRef.current?.scrollToEnd({ animated: true });
        return;
      }

      if (response.success && response.clasificacion_principal) {
        const { categoria, confianza } = response.clasificacion_principal;
        const categoryInfo = response.category_info || CATEGORY_INFO[categoria] || CATEGORY_INFO.inorganico;

        setResult({
          success: true,
          categoria: categoria,
          categoriaLabel: categoryInfo.label,
          confianza: confianza,
          color: categoryInfo.color,
          bgColor: categoryInfo.bgColor,
          icon: categoryInfo.icon,
          descripcion: categoryInfo.descripcion || categoryInfo.description,
          ejemplos: categoryInfo.ejemplos || categoryInfo.examples,
          topPredicciones: response.top_predicciones || []
        });

        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }

    } catch (err) {
      console.error("❌ Error crítico:", err);
      Alert.alert("Error", `Error al procesar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setResult(null);
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing={cameraFacing} />
        
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.captureBtn} onPress={capturePhoto}>
            <View style={styles.captureDot} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCamera(false)}>
          <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
        {/* SISTEMA DE CLASIFICACIÓN */}
        <View style={styles.infoCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>IA</Text>
          </View>
          <Text style={styles.infoTitle}>Sistema de Clasificación</Text>
          <Text style={styles.infoSubtitle}>
            Clasificación automática de residuos mediante inteligencia artificial
          </Text>
        </View>

        {/* BOTONES PRINCIPALES */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cameraButton} onPress={startCamera}>
            <Ionicons name="camera" size={28} color="#fff" />
            <Text style={styles.buttonText}>Abrir Cámara</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Ionicons name="image" size={28} color="#fff" />
            <Text style={styles.buttonText}>Subir Imagen</Text>
          </TouchableOpacity>
        </View>

        {/* IMAGEN CAPTURADA */}
        {capturedImage && (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Imagen Capturada</Text>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: capturedImage }} style={styles.capturedImage} resizeMode="contain" />
            </View>

            <View style={styles.imageActions}>
              <TouchableOpacity 
                style={styles.analyzeButton} 
                onPress={handleAnalyze}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.buttonText}>Analizando...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="flash" size={22} color="#fff" />
                    <Text style={styles.buttonText}>Analizar con IA</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                <Text style={[styles.buttonText, { color: "#ef4444" }]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* RESULTADOS */}
        {result?.success && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Resultado del Análisis</Text>
            
            <View style={[styles.resultCard, { backgroundColor: result.bgColor, borderColor: result.color }]}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultIcon}>{result.icon}</Text>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultCategory, { color: result.color }]}>
                    {result.categoriaLabel}
                  </Text>
                  <Text style={[styles.resultConfidence, { color: result.color }]}>
                    {Math.round(result.confianza)}% Confianza
                  </Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${result.confianza}%`, backgroundColor: result.color }]} />
              </View>

              <Text style={styles.resultDescription}>{result.descripcion}</Text>
              <Text style={styles.resultExamples}>Ejemplos: {result.ejemplos}</Text>
            </View>

            {result.topPredicciones && result.topPredicciones.length > 0 && (
              <View style={styles.predictionsSection}>
                <Text style={styles.predictionsTitle}>Predicciones Principales</Text>
                {result.topPredicciones.slice(0, 3).map((pred, idx) => {
                  const catInfo = CATEGORY_INFO[pred.categoria.toLowerCase()] || CATEGORY_INFO.inorganico;
                  return (
                    <View key={idx} style={[styles.predictionCard, { backgroundColor: catInfo.bgColor, borderColor: catInfo.color }]}>
                      <View style={styles.predictionHeader}>
                        <Text style={styles.predictionIcon}>{catInfo.icon}</Text>
                        <Text style={styles.predictionLabel}>{catInfo.label}</Text>
                        <Text style={[styles.predictionConfidence, { color: catInfo.color }]}>
                          {Math.round(pred.confianza)}%
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <TouchableOpacity style={styles.newAnalysisButton} onPress={handleReset}>
              <Ionicons name="refresh" size={22} color="#fff" />
              <Text style={styles.buttonText}>Nuevo Análisis</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ERROR / NO DETECCIÓN */}
        {result?.no_detection && (
          <View style={styles.errorSection}>
            <View style={styles.errorCard}>
              <Ionicons name="information-circle" size={48} color="#f59e0b" />
              <Text style={styles.errorTitle}>No se detectaron objetos</Text>
              <Text style={styles.errorMessage}>{result.message}</Text>
              
              {result.suggestions && result.suggestions.length > 0 && (
                <View style={styles.suggestions}>
                  <Text style={styles.suggestionsTitle}>Sugerencias:</Text>
                  {result.suggestions.map((sug, idx) => (
                    <Text key={idx} style={styles.suggestionItem}>• {sug}</Text>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.retryButton} onPress={handleReset}>
                <Ionicons name="refresh" size={22} color="#fff" />
                <Text style={styles.buttonText}>Intentar de Nuevo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#10b981"
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16
  },
  iconText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff"
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center"
  },
  infoSubtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20
  },
  cameraButton: {
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 18,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  uploadButton: {
    backgroundColor: "#374151",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 18,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff"
  },
  imageSection: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12
  },
  imageWrapper: {
    backgroundColor: "#000",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#10b981",
    overflow: "hidden",
    height: 300,
    marginBottom: 16
  },
  capturedImage: {
    width: "100%",
    height: "100%"
  },
  imageActions: {
    gap: 12
  },
  analyzeButton: {
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12
  },
  resetButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ef4444"
  },
  resultsSection: {
    marginTop: 20
  },
  resultCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12
  },
  resultIcon: {
    fontSize: 40
  },
  resultInfo: {
    flex: 1
  },
  resultCategory: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4
  },
  resultConfidence: {
    fontSize: 14,
    fontWeight: "700"
  },
  progressBar: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 12
  },
  progressFill: {
    height: "100%"
  },
  resultDescription: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    lineHeight: 20,
    fontWeight: "500"
  },
  resultExamples: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 20
  },
  predictionsSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    marginBottom: 16
  },
  predictionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12
  },
  predictionCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 8
  },
  predictionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  predictionIcon: {
    fontSize: 24
  },
  predictionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151"
  },
  predictionConfidence: {
    fontSize: 14,
    fontWeight: "700"
  },
  newAnalysisButton: {
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12
  },
  errorSection: {
    marginTop: 20
  },
  errorCard: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fbbf24"
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#92400e",
    marginTop: 16,
    marginBottom: 12
  },
  errorMessage: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16
  },
  suggestions: {
    width: "100%",
    marginBottom: 20
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10
  },
  suggestionItem: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 22,
    marginBottom: 6
  },
  retryButton: {
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12,
    width: "100%"
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000"
  },
  camera: {
    flex: 1
  },
  cameraControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center"
  },
  captureBtn: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 4,
    borderColor: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    justifyContent: "center",
    alignItems: "center"
  },
  captureDot: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#10b981"
  },
  cancelBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 12,
    borderRadius: 50
  }
});
