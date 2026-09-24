import {
    StyleProp,
    TextInputProps,
    View,
    ViewStyle,
    Text,
    TextInput,
    StyleSheet,
} from "react-native";

type FormInputProps = TextInputProps & {
    label: string;
    containerStyle?: StyleProp<ViewStyle>;
};

export const FormInput = ({
    label,
    containerStyle,
    style,
    ...inputProps
}: FormInputProps) => {
    return (
        <View style={containerStyle}>
            <Text style={styles.label}>{label}</Text>
            <TextInput {...inputProps} style={styles.input}></TextInput>
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        height: 48,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        color: "#1a1a1a",
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333333",
        marginBottom: 8,
        marginTop: 16,
    },
});
