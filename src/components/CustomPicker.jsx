// src/components/CustomPicker.jsx
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { authStyles } from "../styles/authStyles";


export const CustomPicker = ({
                                 value,
                                 onValueChange,
                                 items,
                                 placeholder,
                                 disabled
                             }) => (
    <View style={[
        authStyles.pickerContainer,
        disabled && authStyles.pickerDisabled
    ]}>
        <Picker
            selectedValue={value}
            onValueChange={onValueChange}
            style={authStyles.picker}
            enabled={!disabled}
            dropdownIconColor="#2d6a4f"
        >
            <Picker.Item label={placeholder} value="" />
            {items.map((item) => (
                <Picker.Item
                    key={item.id}
                    label={item.nombre}
                    value={item.id.toString()}
                />
            ))}
        </Picker>
    </View>
);