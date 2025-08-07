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
        { name: "🔐 Hapus Jejak", value: "`/forgetme` • Samarkan data kamu di channel tertentu." },
        { name: "🧠 Kelola model AI", value: "`/model` • Atur kecerdasan respon Sarah." },
        { name: "🛠️ Kontrol Channel Sarah", value: "`/chat` • Kelola Sarah di channel (Administrator)." },
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
        { name: "Subcommands:", value: "`/afk alasan: nyari makan`" },
        {
          name: "Contoh Respon:",
          value:
            '\`“🔕 user lagi AFK nih. Katanya ‘nyari rokok’. Udah 15 menit nggak kelihatan.”\`\n\`“📌 user off dulu. Reason: nyari rokok. Jangan dicariin dulu ya~”\`',
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
          name: "Catatan",
          value: "• Hanya Administrator yang bisa pakai command ini.\n• `Chat channels` untuk liat list channel aktif",
        },
      ],
    },
  ],

  forgetme: [
    {
      title: "Forgetme",
      description:
        "Samarkan jejak chat kamu di channel tertentu atau bisa di bilang kaya buat percakapan baru.",
      fields: [
        {
          name: "Catatan:",
          value:
            "• Persona juga akan direset jadi default → Netral.\n• Total pesan di profile tidak terhapus",
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
          name: "Catatan:",
          value:
            "• Badge muncul otomatis berdasarkan level\n• XP Booster aktif di semua channel Sarah",
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
            "`/model list`\n`/model info`\n`/model set choice: Sarah Core`",
        },
        {
          name: "Catatan:",
          value:
            "• RPM = request per menit\n• TPM = token per menit\n• RPD = request per hari\n• Default model `Legacy Lite`.\n• Beberapa model mungkin lemot.",
        },
      ],
    },
  ],

  persona: [
    {
      title: "Persona",
      description:
        "Atur atau lihat gaya bicara Sarah sesuai kebutuhan masing-masing user.",
      fields: [
        {
          name: "Subcommands:",
          value:
            "`/persona set gaya: ceria`\n`/persona preview gaya: kalem`",
        },
        {
          name: "Catatan:",
          value:
            "• Gaya bicara default → Netral\n• Perubahan akan tampil di profile\n• Kembali default → Netral jika menggunakan `/forgetme`.",
        },
      ],
    },
  ],

  profile: [
    {
      title: "Profile",
      description:
        "Lihat aktivitas kamu selama ini. XP, badge, dan gaya bicara ditampilkan dalam visual yang stylish.",
      fields: [
        {
          name: "Subcommands:",
          value:
            "`/profile user:@username`",
        },
        {
          name: "Catatan:",
          value: "• Data tersimpan secara global.",
        },
      ],
    },
  ],

  send: [
    {
      title: "Send",
      description:
        "Kirim pesan lewat Sarah. Bisa teks biasa atau embed warna-warni, cocok buat pengumuman dan lain lain.",
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