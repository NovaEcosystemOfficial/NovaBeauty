import SwiftUI
import SwiftData
import UIKit

struct ProfiloView: View {
    @EnvironmentObject var themeManager: ThemeManager
    
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
    @State private var confermaReset = false   // 👈 NEW

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

                        Text("Beauty Souls")
                            .font(.title.bold())
                            .foregroundColor(themeManager.theme.primary)

                        Text("Estetica & Benessere")
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
                Button("Cancella", role: .destructive) {
                    resetAttivita()
                }
                Button("Annulla", role: .cancel) { }
            } message: {
                Text("Perderai il profilo attuale")
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
        if let profilo = profili.first {
            profilo.nome = nome
            profilo.telefono = telefono
            profilo.indirizzo = indirizzo
            profilo.email = email
            profilo.orari = orari
        } else {
            let nuovo = ProfiloAttivita(
                nome: nome,
                telefono: telefono,
                indirizzo: indirizzo,
                email: email,
                orari: orari,
                tipoAttivita: ""
            )
            context.insert(nuovo)
        }

        try? context.save()
    }

    private func caricaProfilo() {
        guard let profilo = profili.first else { return }

        nome = profilo.nome
        telefono = profilo.telefono
        indirizzo = profilo.indirizzo
        email = profilo.email
        orari = profilo.orari
    }

    // 🔥 RESET
    private func resetAttivita() {
        for profilo in profili {
            context.delete(profilo)
        }
        try? context.save()
    }
}
