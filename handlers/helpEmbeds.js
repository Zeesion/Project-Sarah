export const helpEmbeds = {
  menu: [
    {
      title: "Sarah command list",
      description: "Pilih fitur yang ingin kamu eksplorasi:",
      fields: [
        { name: "🎭 Gaya Chat Adaptive", value: "`/persona` • Ubah gaya respon Sarah." },
        { name: "🎉 Sambutan Otomatis", value: "`/afk` • Sarah nyapa kamu pas balik dari AFK." },
        { name: "🏆 XP & Leveling", value: "`/leaderboard` • Ngobrol aktif bikin XP naik." },
        { name: "🏅 Profil & Badge", value: "`/profile` • Lihat statistik dan aktivitas kamu." },
        { name: "🔐 Hapus Jejak", value: "`/forgetme` • Anonimkan data kamu di channel tertentu." },
        { name: "🧠 Kelola model AI", value: "`/model` • Atur engine pemrosesan respon Sarah." },
        { name: "🛠️ Kontrol Channel Sarah", value: "`/chat` • Aktifkan/Nonaktifkan Sarah di channel (Administrator)." },
        { name: "📢 Kirim Pesan Khusus", value: "`/send` • Kirim pesan text atau embed (Administrator)." }
      ]
    }
  ],
  afk: [
    {
      title: "Afk",
      description:
        "Tandai kamu lagi rehat. Sarah bakal kasih kabar ke yang nyebut kamu, lengkap sama alasan dan durasinya.",
      fields: [
        { name: "Cara Pakai:", value: "`/afk`\n`/afk alasan: nyari makan`" },
        {
          name: "Contoh Respon:",
          value:
            '“🔕 user lagi AFK nih. Katanya ‘nyari rokok’. Udah 15 menit nggak kelihatan.”\n“📌 user off dulu. Reason: nyari rokok. Jangan dicariin dulu ya~”',
        },
      ],
    },
  ],

  chat: [
    {
      title: "Chat",
      description:
        "Aktifin atau nonaktifin chat Sarah di channel. Cocok buat ngatur ruang ngobrol biar tetap relevan.",
      fields: [
        {
          name: "Subcommands:",
          value:
            "`/chat enable`\n`/chat disable`\n`/chat channels`",
        },
        {
          name: "Contoh Respon:",
          value:
            '“✅ Chat Sarah diaktifkan di channel ini!”\n“⚠️ Channel ini sudah nonaktif.”\n“📡 Channel Chat Aktif → #sarah-chat ✅ Aktif sejak 25 Juli 2025”',
        },
        {
          name: "Catatan",
          value: "• Hanya Administrator yang bisa pakai command ini.",
        },
      ],
    },
  ],

  forgetme: [
    {
      title: "Forgetme",
      description:
        "Anonimkan jejak chat kamu di channel tertentu. Sarah akan bersih-bersih identitas kamu dari pesan sebelumnya tanpa drama.",
      fields: [
        {
          name: "Cara Pakai:",
          value: "`/forgetme channel: #nongkrong`",
        },
        {
          name: "Contoh Respon:",
          value:
            "“✅ Jejak kamu *12 pesan* di <#12345> sudah dianonimkan.”",
        },
        {
          name: "Catatan:",
          value:
            "• Kalau kamu pakai `/persona`, data itu juga akan dibersihkan.",
        },
      ],
    },
  ],

  leaderboard: [
    {
      title: "Leaderboard",
      description:
        "Lihat siapa yang paling aktif dan rajin chat. Peringkat, level, dan badge semua tampil di sini.",
      fields: [
        {
          name: "Cara Pakai:",
          value: "`/leaderboard`",
        },
        {
          name: "Catatan:",
          value:
            "• Badge muncul otomatis berdasarkan level\n• Booster aktif di channel yang ada Sarah-nya\n• Menampilkan peringkat top 10",
        },
      ],
    },
  ],

  model: [
    {
      title: "Model",
      description:
        "Kelola model respons Sarah. Cocok buat tuning vibes, performa, atau eksperimen gaya.",
      fields: [
        {
          name: "Subcommands:",
          value:
            "`/model list`\n`/model info`\n`/model set choice: gemini-2.5-flash`",
        },
        {
          name: "Contoh Respon:",
          value:
            "“✅ Model berhasil diubah ke: `gemini-2.5-flash` 🔄”\n“📦 Daftar Model Gemini: … RPM, TPM, RPD”",
        },
        {
          name: "Catatan:",
          value:
            "• RPM = request per menit\n• TPM = token per menit\n• RPD = request per hari",
        },
      ],
    },
  ],

  persona: [
    {
      title: "Persona",
      description:
        "Atur atau lihat gaya bicara Sarah sesuai mood channel atau user.",
      fields: [
        {
          name: "Subcommands:",
          value:
            "`/persona set gaya: ceria`\n`/persona preview gaya: kalem`",
        },
        {
          name: "Catatan:",
          value:
            "• Gaya bicara default → Netral\n• Perubahan akan tersimpan di profile\n• Menjadi netral apabila menggunakan forgetme.",
        },
      ],
    },
  ],

  profile: [
    {
      title: "Profile",
      description:
        "Lihat aktivitas kamu di komunitas. XP, badge, dan gaya bicara ditampilkan dalam visual yang stylish.",
      fields: [
        {
          name: "Catatan:",
          value: "• Terhubung dengan command persona.",
        },
      ],
    },
  ],

  send: [
    {
      title: "Send",
      description:
        "Kirim pesan lewat Sarah. Bisa teks biasa atau embed warna-warni, pas buat pengumuman ala admin.",
      fields: [
        {
          name: "Subcommands:",
          value:
            "`/send message channel:`\n`/send embed channel: color:`\n`/send cancel`",
        },
        {
          name: "Catatan:",
          value:
            "• Hanya Administrator yang bisa pakai\n• Kosongkan color → default biru\n• Warna hex format: `#ff00ff`",
        },
      ],
    },
  ],
};

export default helpEmbeds;