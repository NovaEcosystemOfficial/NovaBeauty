import SwiftUI
import FirebaseAuth

struct LoginView: View {
    @State private var email = ""
    @State private var password = ""
    @State private var errorMessage = ""
    @State private var infoMessage = ""
    @State private var isLoading = false

    var body: some View {

        VStack(spacing: 20) {

            Text("Beauty & Souls")
                .font(.largeTitle)
                .fontWeight(.bold)

            TextField("Email", text: $email)
                .textFieldStyle(.roundedBorder)
                .textInputAutocapitalization(.never)
                .keyboardType(.emailAddress)
                .textContentType(.emailAddress)

            SecureField("Password", text: $password)
                .textFieldStyle(.roundedBorder)
                .textContentType(.password)

            Button("Accedi") {
                loginUser()
            }
            .buttonStyle(.borderedProminent)
            .disabled(isLoading)

            Button("Registrati") {
                registerUser()
            }
            .buttonStyle(.bordered)
            .disabled(isLoading)

            Button("Password dimenticata?") {
                resetPassword()
            }
            .disabled(isLoading)

            if isLoading {
                ProgressView()
            }

            if !errorMessage.isEmpty {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
            }

            if !infoMessage.isEmpty {
                Text(infoMessage)
                    .foregroundColor(.green)
                    .multilineTextAlignment(.center)
            }
        }
        .padding()
    }

    private func loginUser() {
        guard validate(requirePassword: true) else { return }
        beginRequest()
        Auth.auth().signIn(withEmail: email, password: password) { _, error in
            DispatchQueue.main.async {
                isLoading = false
                errorMessage = error?.localizedDescription ?? ""
            }
        }
    }

    private func registerUser() {
        guard validate(requirePassword: true), password.count >= 6 else {
            errorMessage = "La password deve contenere almeno 6 caratteri."
            return
        }
        beginRequest()
        Auth.auth().createUser(withEmail: email, password: password) { result, error in
            DispatchQueue.main.async {
                isLoading = false
                errorMessage = error?.localizedDescription ?? ""
                if error == nil {
                    result?.user.sendEmailVerification()
                    infoMessage = "Account creato. Controlla la tua email per la verifica."
                }
            }
        }
    }

    private func resetPassword() {
        guard validate(requirePassword: false) else { return }
        beginRequest()
        Auth.auth().sendPasswordReset(withEmail: email.trimmed) { error in
            DispatchQueue.main.async {
                isLoading = false
                errorMessage = error?.localizedDescription ?? ""
                if error == nil {
                    infoMessage = "Email per il recupero password inviata."
                }
            }
        }
    }

    private func validate(requirePassword: Bool) -> Bool {
        let cleanEmail = email.trimmed
        guard !cleanEmail.isEmpty, cleanEmail.contains("@") else {
            errorMessage = "Inserisci un indirizzo email valido."
            return false
        }
        guard !requirePassword || !password.isEmpty else {
            errorMessage = "Inserisci la password."
            return false
        }
        email = cleanEmail
        return true
    }

    private func beginRequest() {
        isLoading = true
        errorMessage = ""
        infoMessage = ""
    }
}

#Preview {
    LoginView()
}
