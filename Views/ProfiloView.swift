import SwiftUI
import SwiftData
import UIKit

struct ProfiloView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject private var session: AuthSessionManager

    @Environment(\.modelContext) private var context
    @Query private var profili: [ProfiloAttivita]

    @State private var nome = ""
    @State private var telefono = ""
    @State private var indirizzo = ""
    @State private var email = ""
    @State private var orari = ""
    @State private var descrizione = ""

    @State private var selectedImage: UIImage?
    @State private var showImagePicker = false
    @State private var confermaReset = false
    @State private var errorMessage = ""
    @State private var successMessage = ""
    @State private var isSyncing = false

    private var profiliUtente: [ProfiloAttivita] {
        guard let userID = session.userID else { return [] }
        return profili.filter { $0.ownerID == userID }
    }

    private var profiloCorrente: ProfiloAttivita? {
        profiliUtente.first
    }

    private var nomeVisualizzato: String {
        let value = nome.trimmed
        return value.isEmpty ? "Beauty Souls" : value
    }

    private var tipoVisualizzato: String {
        switch profiloCorrente?.tipoAttivita {
        case "barber": return "Barber Shop"
        case "parrucchiere": return "Parrucchiere"
        case "nails": return "Nail Artist"
        default: return "Estetica & Benessere"
        }
    }

    var body: some View {

        NavigationStack {
            ZStack {
                themeManager.theme.background
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 25) {

                        // FOTO PROFILO
                        Button {
                            showImagePicker = true
                        } label: {

                            if let image = selectedImage {
                                Image(uiImage: image)
                                    .resizable()
                                    .scaledToFill()
                                    .frame(width: 120, height: 120)
                                    .clipShape(Circle())
                                    .shadow(radius: 8)

                            } else {
                                Circle()
                                    .fill(themeManager.theme.primary)
                                    .frame(width: 120, height: 120)
                                    .overlay(
                                        Image(systemName: "camera.fill")
                                            .font(.largeTitle)
                                            .foregroundColor(.white)
                                    )
                                    .shadow(radius: 8)
                            }
                        }

                        Text(nomeVisualizzato)
                            .font(.title.bold())
                            .foregroundColor(themeManager.theme.primary)

                        Text(tipoVisualizzato)
                            .foregroundColor(themeManager.theme.text.opacity(0.6))

                        Text("Profilo Attività")
                            .font(.title2.bold())
                            .foregroundColor(themeManager.theme.primary)
                            .padding(.top, 10)

                        Group {
                            campo("Nome Attività", text: $nome)
                            campo("Telefono", text: $telefono)
                            campo("Indirizzo", text: $indirizzo)
                            campo("Email", text: $email)
                            campo("Orari", text: $orari)
                            campo("Descrizione", text: $descrizione)
                        }

                        // ✅ SALVA
                        Button("Salva Profilo") {
                            salva()
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(themeManager.theme.primary)
                        .foregroundColor(.white)
                        .cornerRadius(15)

                        // 🔥 CAMBIA ATTIVITÀ
                        Button("Cambia Attività") {
                            confermaReset = true
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.red.opacity(0.9))
                        .foregroundColor(.white)
                        .cornerRadius(15)
                        .padding(.top, 5)

                        Button("Esci dall’account") {
                            logout()
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .foregroundColor(themeManager.theme.primary)

                        Button {
                            backupCloud()
                        } label: {
                            HStack {
                                if isSyncing {
                                    ProgressView()
                                }
                                Text(isSyncing ? "Sincronizzazione…" : "Salva backup cloud")
                            }
                            .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.bordered)
                        .disabled(isSyncing)

                        if !successMessage.isEmpty {
                            Text(successMessage)
                                .font(.footnote)
                                .foregroundColor(.green)
                        }

                    }
                    .padding()
                }
            }
            .sheet(isPresented: $showImagePicker) {
                ImagePicker(selectedImage: $selectedImage)
            }
            .onAppear {
                caricaProfilo()
            }
            .alert("Sei sicuro?", isPresented: $confermaReset) {
                Button("Continua", role: .destructive) {
                    resetAttivita()
                }
                Button("Annulla", role: .cancel) { }
            } message: {
                Text("Potrai scegliere un nuovo tipo di attività senza perdere clienti, appuntamenti o magazzino.")
            }
            .alert("Errore", isPresented: Binding(
                get: { !errorMessage.isEmpty },
                set: { if !$0 { errorMessage = "" } }
            )) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage)
            }
        }
    }

    private func campo(_ titolo: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(titolo)
                .font(.subheadline)
                .foregroundColor(themeManager.theme.text.opacity(0.6))

            TextField(titolo, text: text)
                .padding()
                .background(themeManager.theme.card)
                .cornerRadius(12)
        }
    }

    private func salva() {
        guard let userID = session.userID else {
            errorMessage = "Sessione non valida."
            return
        }
        guard !nome.trimmed.isEmpty else {
            errorMessage = "Inserisci il nome dell’attività."
            return
        }

        if let profilo = profiloCorrente {
            profilo.nome = nome
            profilo.telefono = telefono
            profilo.indirizzo = indirizzo
            profilo.email = email
            profilo.orari = orari
            profilo.descrizione = descrizione
            if let selectedImage {
                profilo.immagine = selectedImage.jpegData(compressionQuality: 0.82)
            }
        } else {
            let nuovo = ProfiloAttivita(
                ownerID: userID,
                nome: nome.trimmed,
                telefono: telefono,
                indirizzo: indirizzo,
                email: email,
                orari: orari,
                tipoAttivita: "estetica",
                descrizione: descrizione,
                immagine: selectedImage?.jpegData(compressionQuality: 0.82)
            )
            context.insert(nuovo)
        }

        do {
            try context.save()
            successMessage = "Profilo salvato."
        } catch {
            errorMessage = "Salvataggio non riuscito: \(error.localizedDescription)"
        }
    }

    private func caricaProfilo() {
        guard let profilo = profiloCorrente else { return }

        nome = profilo.nome
        telefono = profilo.telefono
        indirizzo = profilo.indirizzo
        email = profilo.email
        orari = profilo.orari
        descrizione = profilo.descrizione
        if let data = profilo.immagine {
            selectedImage = UIImage(data: data)
        }
    }

    private func resetAttivita() {
        guard let profilo = profiloCorrente else { return }
        profilo.tipoAttivita = ""
        do {
            try context.save()
        } catch {
            errorMessage = "Modifica non riuscita: \(error.localizedDescription)"
        }
    }

    private func logout() {
        do {
            try session.signOut()
        } catch {
            errorMessage = "Disconnessione non riuscita: \(error.localizedDescription)"
        }
    }

    private func backupCloud() {
        guard let userID = session.userID else {
            errorMessage = "Sessione non valida."
            return
        }

        isSyncing = true
        successMessage = ""
        Task {
            defer { isSyncing = false }
            do {
                try await CloudBackupService.backup(userID: userID, context: context)
                successMessage = "Backup cloud completato."
            } catch {
                errorMessage = "Backup non riuscito: \(error.localizedDescription)"
            }
        }
    }
}
