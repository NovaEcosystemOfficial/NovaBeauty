import SwiftUI
import FirebaseAuth

struct LoginView: View {

    @State private var email = ""
    @State private var password = ""
    @State private var errorMessage = ""

    var body: some View {

        VStack(spacing: 20) {

            Text("Beauty & Souls")
                .font(.largeTitle)
                .fontWeight(.bold)

            TextField("Email", text: $email)
                .textFieldStyle(.roundedBorder)
                .textInputAutocapitalization(.never)
                .keyboardType(.emailAddress)

            SecureField("Password", text: $password)
                .textFieldStyle(.roundedBorder)

            Button("Accedi") {
                loginUser()
            }
            .buttonStyle(.borderedProminent)

            Button("Registrati") {
                registerUser()
            }
            .buttonStyle(.bordered)

            if !errorMessage.isEmpty {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
            }
        }
        .padding()
    }

    private func loginUser() {
        Auth.auth().signIn(withEmail: email, password: password) { _, error in
            if let error = error {
                DispatchQueue.main.async {
                    errorMessage = error.localizedDescription
                }
                return
            }
            DispatchQueue.main.async {
                errorMessage = ""
            }
        }
    }

    private func registerUser() {
        Auth.auth().createUser(withEmail: email, password: password) { _, error in
            if let error = error {
                DispatchQueue.main.async {
                    errorMessage = error.localizedDescription
                }
                return
            }
            DispatchQueue.main.async {
                errorMessage = ""
            }
        }
    }
}

#Preview {
    LoginView()
}
