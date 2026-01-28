// src/components/CameraCapture.jsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions
  
} from "react-native";
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { detectWasteWithAI, CATEGORY_INFO } from "../api/deteccionIAApi";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CameraCapture({ visible, onCapture, onClose }) {
  const [mode, setMode] = useState("preview");
  const [capturedImage, setCapturedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('back');
  
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const resetCamera = () => {
    setCapturedImage(null);
    setResult(null);
    setMode("preview");
  };

  const handleClose = () => {
    resetCamera();
    onClose?.();
  };

  const startCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permiso Denegado", "Se necesita acceso a la cámara");
        return;
      }
    }
    setMode("camera");
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
        setMode("image");
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

    console.log('CameraCapture: pickImage invoked');
    try {
      // Support different expo-image-picker versions: MediaTypeOptions or MediaType
      const mediaTypesOption = ImagePicker?.MediaTypeOptions?.Images ?? ImagePicker?.MediaType?.Images;
      console.log('CameraCapture: mediaTypesOption', mediaTypesOption);
      const pickerOptions = { allowsEditing: false, quality: 0.8, base64: true };
      if (mediaTypesOption) pickerOptions.mediaTypes = mediaTypesOption;

      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

      console.log('CameraCapture: picker result', result?.assets?.[0] ? 'has asset' : 'no asset');
      const cancelled = result.canceled ?? result.cancelled;
      if (cancelled) return;

      const asset = result.assets?.[0] || result;
      if (!asset) return;

      // Prefer base64 if provided by the picker
      if (asset.base64) {
        const mime = asset.type || 'image/jpeg';
        const imageData = `data:${mime};base64,${asset.base64}`;
        setCapturedImage(imageData);
        setMode('image');
        return;
      }

      // Fallback: read file from uri and convert to base64
      if (asset.uri) {
        try {
          const fileBase64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
          const imageData = `data:image/jpeg;base64,${fileBase64}`;
          setCapturedImage(imageData);
          setMode('image');
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

  const handleSendImage = async () => {
    if (!capturedImage) {
      Alert.alert("Error", "No hay imagen para analizar");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log("📤 Enviando imagen para análisis...");
      const response = await detectWasteWithAI(capturedImage);

      console.log("📥 Respuesta:", response);

      // CASO 1: Error del servidor
      if (!response.success && response.error) {
        Alert.alert("Error", response.error);
        return;
      }

      // CASO 2: No se detectaron objetos
      if (!response.success && response.no_detection) {
        setResult({
          no_detection: true,
          message: response.message,
          suggestions: response.suggestions || []
        });
        return;
      }

      // CASO 3: Éxito
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
          topPredicciones: response.top_predicciones || [],
          capturedImage: capturedImage
        });
      } else {
        Alert.alert("Error", "Respuesta inesperada del servidor");
      }

    } catch (err) {
      console.error("❌ Error crítico:", err);
      Alert.alert("Error", `Error al procesar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUseResult = () => {
    if (result?.success && result.capturedImage) {
      const detectionData = {
        image: result.capturedImage,
        categoria: result.categoria,
        categoriaLabel: result.categoriaLabel,
        confianza: result.confianza,
        timestamp: new Date().toISOString()
      };
      
      onCapture?.(detectionData);
      handleClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {result?.success ? "Análisis Completado" : "Clasificación IA"}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {/* RESULTADOS EXITOSOS */}
          {result?.success && (
            <View style={styles.resultContainer}>
              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" /> Imagen Analizada
                </Text>
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: result.capturedImage }} style={styles.resultImage} resizeMode="contain" />
                </View>
              </View>

              <View style={[styles.categoryCard, { backgroundColor: result.bgColor, borderColor: result.color }]}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryIcon}>{result.icon}</Text>
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryLabel, { color: result.color }]}>{result.categoriaLabel}</Text>
                    <Text style={[styles.confidence, { color: result.color }]}>
                      {Math.round(result.confianza)}% Confianza
                    </Text>
                  </View>
                </View>

                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${result.confianza}%`, backgroundColor: result.color }]} />
                </View>

                <Text style={styles.description}>{result.descripcion}</Text>
                <Text style={styles.examples}>Ejemplos: {result.ejemplos}</Text>
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
                        <View style={styles.predictionBar}>
                          <View style={[styles.predictionFill, { width: `${pred.confianza}%`, backgroundColor: catInfo.color }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleUseResult}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.btnText}>Usar Resultado</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={resetCamera}>
                  <Ionicons name="camera-outline" size={20} color="#374151" />
                  <Text style={[styles.btnText, { color: "#374151" }]}>Nuevo Análisis</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* NO DETECCIÓN */}
          {result?.no_detection && (
            <View style={styles.resultContainer}>
              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="information-circle" size={20} color="#fbbf24" /> Imagen Analizada
                </Text>
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: capturedImage }} style={styles.resultImage} resizeMode="contain" />
                </View>
              </View>

              <View style={styles.warningBox}>
                <Ionicons name="alert-circle" size={24} color="#f59e0b" />
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>No se detectaron objetos</Text>
                  <Text style={styles.warningText}>{result.message}</Text>
                  {result.suggestions && result.suggestions.length > 0 && (
                    <View style={styles.suggestions}>
                      <Text style={styles.suggestionsTitle}>Sugerencias:</Text>
                      {result.suggestions.map((sug, idx) => (
                        <Text key={idx} style={styles.suggestionItem}>• {sug}</Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={resetCamera}>
                  <Ionicons name="refresh-outline" size={20} color="#fff" />
                  <Text style={styles.btnText}>Intentar de Nuevo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* PREVIEW */}
          {!result && mode === "preview" && (
            <View style={styles.previewContainer}>
              <View style={styles.placeholder}>
                <View style={styles.placeholderIcon}>
                  <Text style={styles.placeholderIconText}>IA</Text>
                </View>
                <Text style={styles.placeholderTitle}>Sistema de Clasificación</Text>
                <Text style={styles.placeholderText}>
                  Clasificación automática de residuos mediante inteligencia artificial
                </Text>
              </View>

              <TouchableOpacity style={[styles.previewBtn, styles.cameraBtn]} onPress={startCamera}>
                <Ionicons name="camera" size={32} color="#fff" />
                <Text style={styles.previewBtnText}>Abrir Cámara</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.previewBtn, styles.uploadBtn]} onPress={pickImage}>
                <Ionicons name="image" size={32} color="#fff" />
                <Text style={styles.previewBtnText}>Subir Imagen</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* CÁMARA ACTIVA */}
          {!result && mode === "camera" && (
            <View style={styles.cameraContainer}>
              <CameraView ref={cameraRef} style={styles.camera} facing={cameraFacing} />
              
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.captureBtn} onPress={capturePhoto}>
                  <View style={styles.captureDot} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.cancelBtn} onPress={resetCamera}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* IMAGEN CAPTURADA */}
          {!result && mode === "image" && capturedImage && (
            <View style={styles.imageReviewContainer}>
              <View style={styles.imageWrapper}>
                <Image source={{ uri: capturedImage }} style={styles.capturedImage} resizeMode="contain" />
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>Imagen lista para análisis</Text>
                <Text style={styles.infoSubtext}>
                  El sistema analizará la imagen mediante inteligencia artificial
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.btn, styles.btnPrimary]} 
                  onPress={handleSendImage}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator color="#fff" />
                      <Text style={styles.btnText}>Analizando...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="flash-outline" size={20} color="#fff" />
                      <Text style={styles.btnText}>Analizar Imagen</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.btn, styles.btnSecondary]} 
                  onPress={resetCamera}
                  disabled={loading}
                >
                  <Ionicons name="refresh-outline" size={20} color="#374151" />
                  <Text style={[styles.btnText, { color: "#374151" }]}>Capturar Otra</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#10b981",
    borderBottomWidth: 3,
    borderBottomColor: "#047857"
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff"
  },
  closeBtn: {
    padding: 8
  },
  body: {
    flex: 1
  },
  bodyContent: {
    padding: 20
  },
  previewContainer: {
    alignItems: "center",
    paddingVertical: 40
  },
  placeholder: {
    backgroundColor: "#fff",
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    marginBottom: 24,
    width: "100%"
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    backgroundColor: "#10b981",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20
  },
  placeholderIconText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff"
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12
  },
  placeholderText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24
  },
  previewBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 18,
    borderRadius: 10,
    marginBottom: 12
  },
  cameraBtn: {
    backgroundColor: "#10b981"
  },
  uploadBtn: {
    backgroundColor: "#374151"
  },
  previewBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700"
  },
  cameraContainer: {
    height: 500,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative"
  },
  camera: {
    flex: 1
  },
  cameraControls: {
    position: "absolute",
    bottom: 30,
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
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  cancelBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16
  },
  imageReviewContainer: {
    paddingBottom: 20
  },
  imageWrapper: {
    backgroundColor: "#000",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#10b981",
    overflow: "hidden",
    marginBottom: 24,
    height: 400
  },
  capturedImage: {
    width: "100%",
    height: "100%"
  },
  resultImage: {
    width: "100%",
    height: "100%"
  },
  infoBox: {
    backgroundColor: "#ecfdf5",
    borderWidth: 2,
    borderColor: "#10b981",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24
  },
  infoText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#047857",
    marginBottom: 8
  },
  infoSubtext: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20
  },
  actions: {
    gap: 12
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    borderRadius: 10
  },
  btnPrimary: {
    backgroundColor: "#10b981"
  },
  btnSecondary: {
    backgroundColor: "#f3f4f6",
    borderWidth: 2,
    borderColor: "#d1d5db"
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff"
  },
  resultContainer: {
    paddingBottom: 20
  },
  imageSection: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16
  },
  categoryCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 24
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12
  },
  categoryIcon: {
    fontSize: 40
  },
  categoryInfo: {
    flex: 1
  },
  categoryLabel: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4
  },
  confidence: {
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
  description: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    lineHeight: 20,
    fontWeight: "500"
  },
  examples: {
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
    marginBottom: 24
  },
  predictionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16
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
    gap: 8,
    marginBottom: 8
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
  predictionBar: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 3,
    overflow: "hidden"
  },
  predictionFill: {
    height: "100%"
  },
  warningBox: {
    backgroundColor: "#fef3c7",
    borderWidth: 2,
    borderColor: "#fbbf24",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    gap: 16,
    marginBottom: 24
  },
  warningContent: {
    flex: 1
  },
  warningTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 12
  },
  warningText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 16
  },
  suggestions: {
    marginTop: 8
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10
  },
  suggestionItem: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 22,
    marginBottom: 6
  }
});
