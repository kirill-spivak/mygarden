import { useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { publicAPI } from "../api/client";
import { AxiosError, isAxiosError } from "axios";
import { FormInput } from "../components/FormInput";

export const SignUpScreen = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");

    const [formErrors, setFormErrors] = useState<string[]>([]);

    const validateForm = (): boolean => {
        setFormErrors([]);

        let valid = true;
        let newErrors = [];

        if (!name.trim()) {
            newErrors.push("Имя обязательно для заполнения");
            valid = false;
        } else if (name.trim().length < 4) {
            newErrors.push("Имя должно содержать не менее 4 символов");
            valid = false;
        }

        const emailRegex =
            /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
        if (!emailRegex.test(email.trim())) {
            newErrors.push("Некорректный email адрес");
            valid = false;
        }
        if (email.trim())
            if (!email.trim()) {
                newErrors.push("Email обязателен для заполнения");
                valid = false;
            }

        if (!password.trim()) {
            newErrors.push("Пароль обязателен для заполнения");
            valid = false;
        }

        if (!passwordConfirmation.trim()) {
            newErrors.push("Подтверждение пароля обязательно для заполнения");
            valid = false;
        }

        if (passwordConfirmation.trim() !== password.trim()) {
            newErrors.push("Пароли должны совпадать");
            valid = false;
        }

        setFormErrors(newErrors);
        return valid;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        try {
            const response = await publicAPI.post("/auth/register", {
                name,
                email,
                password,
            });
        } catch (err) {
            if (isAxiosError(err)) {
                if ([401, 409].includes(err.response?.status as number)) {
                    const data = err.response?.data as {
                        errors?: Record<string, string>;
                        message?: string;
                    };

                    const errors: string[] = [];

                    if (data?.errors) {
                        Object.entries(data.errors).forEach(([_, message]) => {
                            errors.push(message);
                        });
                    } else if (data?.message) {
                        errors.push(data.message);
                    } else {
                        errors.push(
                            "Произошла неизвестная ошибка аутентификации",
                        );
                    }

                    setFormErrors(errors);
                }
            }
        }
    };

    return (
        <KeyboardAvoidingView behavior="height" style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.innerContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerTitle}>Создать аккаунт</Text>
                    </View>

                    {formErrors.length > 0 && (
                        <View style={styles.errorsContainer}>
                            {formErrors.map((err, index) => (
                                <View key={index} style={styles.errorItem}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.errorText}>{err}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.formContainer}>
                        <FormInput
                            label="Имя"
                            value={name}
                            onChangeText={(text) => setName(text)}
                        />

                        <FormInput
                            label="Email"
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                        />

                        <FormInput
                            label="Пароль"
                            value={password}
                            onChangeText={(text) => setPassword(text)}
                            secureTextEntry
                        />
                        <FormInput
                            label="Подтверждение пароля"
                            onChangeText={(text) =>
                                setPasswordConfirmation(text)
                            }
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSignUp}
                        >
                            <Text style={styles.buttonText}>
                                Зарегистрироваться
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    innerContainer: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    headerContainer: {
        alignItems: "center",
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    formContainer: {
        width: "100%",
    },
    button: {
        height: 50,
        backgroundColor: "#007aff",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 32,
        shadowColor: "#007aff",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    buttonText: {
        color: "#ffffff",
    },
    errorsContainer: {},
    errorText: {
        color: "#FF3B30",
        fontSize: 12,
        marginTop: 4,
        fontWeight: "500",
    },
    errorItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginVertical: 2,
    },
    bullet: {
        color: "#D32F2F",
        fontSize: 16,
        marginRight: 8,
        lineHeight: 18,
    },
});
