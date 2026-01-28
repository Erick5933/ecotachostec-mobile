// src/pages/Dashboard/DashboardUser.jsx
import React from "react";
import UserPortal from "../User/UserPortal";

// DashboardUser ahora actúa como un contenedor para el UserPortal "reimaginado"
// que contiene toda la lógica y diseño solicitados en la migración.
export default function DashboardUser({ navigation }) {
    return <UserPortal navigation={navigation} />;
}
