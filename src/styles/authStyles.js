// src/styles/authStyles.js
import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
// Estilos base
safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
},
container: {
    flex: 1,
},
scrollContent: {
    flexGrow: 1,
    padding: 20,
    
},
scrollContentExtended: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
},

// Header y navegación
header: {
    marginBottom: 20,
},
backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 3,
},
backButtonText: {
    color: "#2d6a4f",
    fontSize: 14,
    fontWeight: "500",
},

// Card principal
card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
shadowOpacity: 0.1,
shadowRadius: 20,
elevation: 5,
},
cardHeader: {
    alignItems: "center",
    marginBottom: 32,
},

// Logo y branding
logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
},
logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#2d6a4f",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2d6a4f",
    shadowOffset: { width: 0, height: 8 },
shadowOpacity: 0.3,
shadowRadius: 16,
elevation: 8,
},
logoIconText: {
    fontSize: 32,
},
logoTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e3a2a",
},
title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e3a2a",
    marginBottom: 8,
},
subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
},

// Formularios
form: {
    gap: 20,
},
formGroup: {
    gap: 8,
},
label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#444",
    marginLeft: 4,
},
input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fafafa",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: "#333",
},
passwordContainer: {
    position: "relative",
},
passwordInput: {
    paddingRight: 50,
},
passwordToggle: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
},
passwordToggleText: {
    fontSize: 20,
    opacity: 0.7,
},

// Opciones y checkboxes
optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
},
rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
},
checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#2d6a4f",
},
rememberText: {
    fontSize: 14,
    color: "#666",
},
forgotPassword: {
    fontSize: 14,
    color: "#2d6a4f",
    fontWeight: "500",
},

// Botones
primaryButton: {
    backgroundColor: "#2d6a4f",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#2d6a4f",
    shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.3,
shadowRadius: 8,
elevation: 4,
},
primaryButtonDisabled: {
    backgroundColor: "#95d5b2",
},
primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
},

// Separadores
dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
},
dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
},
dividerText: {
    marginHorizontal: 16,
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
},

// Footer
footer: {
    alignItems: "center",
    marginTop: 16,
},
footerText: {
    fontSize: 14,
    color: "#666",
},
footerLink: {
    color: "#2d6a4f",
    fontWeight: "600",
},

// Alertas de error
errorAlert: {
    backgroundColor: "#ffebee",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
},
errorIcon: {
    marginRight: 12,
    fontSize: 20,
},
errorText: {
    color: "#d32f2f",
    fontSize: 14,
    flex: 1,
},

// Ubicación (Register específico)
ubicacionGroup: {
    marginBottom: 12,
},
ubicacionLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
    marginLeft: 4,
},
pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    overflow: "hidden",
},
pickerDisabled: {
    backgroundColor: "#f0f0f0",
    opacity: 0.7,
},
picker: {
    height: 50,
},
loadingUbicacion: {
    marginTop: 8,
    alignSelf: "center",
},

// Benefits card (Register)
benefitsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.1,
shadowRadius: 8,
elevation: 3,
},
benefitsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e3a2a",
    textAlign: "center",
    marginBottom: 16,
},
benefitsList: {
    gap: 12,
},
benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
},
benefitIcon: {
    width: 20,
    height: 20,
    backgroundColor: "#2d6a4f",
    color: "#fff",
    borderRadius: 10,
    textAlign: "center",
    lineHeight: 20,
    fontSize: 12,
    fontWeight: "bold",
},
benefitText: {
    fontSize: 13,
    color: "#666",
    flex: 1,
},
});

// Estilos específicos para Profile
   export const profileStyles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
},
scrollView: {
    flex: 1,
},
content: {
    padding: 20,
},

// Header del perfil
profileHeader: {
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 3,
},
avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2d6a4f",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
},
avatarIcon: {
    fontSize: 50,
    color: "#fff",
},
profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e3a2a",
},
profileRole: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
},

// Información personal
infoCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 3,
},
infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
},
infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e3a2a",
},
editButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
},
editButtonText: {
    color: "#fff",
    fontWeight: "600",
},

// Campos del formulario
fieldContainer: {
    marginBottom: 15,
},
fieldLabel: {
    marginBottom: 8,
    color: "#555",
    fontWeight: "500",
},
fieldValue: {
    fontSize: 16,
    color: "#333",
},
fieldInfo: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
},
profileInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fafafa",
},

// Botones de acción
actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
},
cancelButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 14,
    alignItems: "center",
    borderRadius: 8,
},
cancelButtonText: {
    color: "#666",
    fontWeight: "600",
},
saveButton: {
    flex: 1,
    backgroundColor: "#2d6a4f",
    padding: 14,
    alignItems: "center",
    borderRadius: 8,
},
saveButtonDisabled: {
    backgroundColor: "#95d5b2",
},
saveButtonText: {
    color: "#fff",
    fontWeight: "600",
},

// Botón de logout
logoutButton: {
    backgroundColor: "#f44336",
    padding: 16,
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
},
logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
},
// Añade estos estilos al archivo authStyles.js
       pickerPlaceholder: {
           fontSize: 16,
           color: "#999",
       },
       pickerValue: {
           color: "#333",
       },
       pickerContainer: {
           borderWidth: 1,
           borderColor: "#e0e0e0",
           backgroundColor: "#fafafa",
           borderRadius: 12,
           overflow: "hidden",
       },
       pickerDisabled: {
           backgroundColor: "#f0f0f0",
           opacity: 0.7,
       },
// Loader
loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
},
});

