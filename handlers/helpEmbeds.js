export const helpEmbeds = {
  menu: [
    {
      title: "Available Commands",
      description: "Pilih kategori untuk melihat detail command.",
      fields: [
        { name: "`🎭` Gaya Chat Adaptive", value: "`/persona` • Ubah gaya respon Sarah." },
        { name: "`🎉` Menandai status", value: "`/afk` • Sarah nandain kamu pas waktu lagi AFK." },
        { name: "`🏆` XP & Leveling", value: "`/leaderboard` • Ngobrol aktif bikin XP naik." },
        { name: "`🏅` Profil & Badge", value: "`/profile` • Lihat statistik dan aktivitas kamu." },
        { name: "`🧼` Hapus Jejak", value: "`/forgetme` • Samarkan data kamu di channel tertentu." },
        { name: "`🧠` Kelola model AI", value: "`/model` • Atur kecerdasan respon Sarah." },

        // Admin Commands:
        { name: "`🛠️` Kontrol Channel Sarah", value: "`/chat` • Kelola Sarah di channel.", requiresAdmin: true },
        { name: "`🛠️` Kirim Pesan Khusus", value: "`/send` • Kirim pesan text atau embed.", requiresAdmin: true },
        { name: "`🛠️` Greeting & Log", value: "`/welcome` • Kostumisasi pesan welcome.", requiresAdmin: true },
      ]
    },
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

  // Details for admin commands
  chat: [
    {
      title: "Chat",
      requiresAdmin: true,
      description:
        "Aktifin atau nonaktifin chat Sarah di channel.",
      fields: [
        {
          name: "Subcommands:",
          value:
            "`/chat enable`\n`/chat disable`\n`/chat channels`",
        },
        {
          name: "Catatan",
          value: "• `Chat channels` untuk liat list channel aktif",
        },
      ],
    },
  ],

  send: [
    {
      title: "Send",
      requiresAdmin: true,
      description:
        "Kirim pesan lewat Sarah. Bisa teks biasa atau embed.",
      fields: [
        {
          name: "Subcommands:",
          value:
            "`/send message channel:`\n`/send embed channel: color:`\n`/send cancel`",
        },
        {
          name: "Catatan:",
          value:
            "• Kosongkan color → default biru\n• Warna hex format: `#ff00ff`",
        },
      ],
    },
  ],

  welcome: [
    {
      title: "Welcome",
      requiresAdmin: true,
      description:
        "Kostumisasi fitur welcome.",
      fields: [
        {
          name: "Tipe:",
          value:
            "• Welcome greeting.\n• Welcome log: `log join` dan `log left`",
        },
        {
          name: "Subcommands:",
          value:
            "`/welcome channel:`\n" +
            "`/welcome disable:`\n" +
            "`/welcome settings:`\n" +
            "`/welcome reset:`\n" +
            "`/welcome test:`",
        },
        {
          name: "Placeholders:",
          value:
            "`{status}` → status user (joined/left)\n" +
            "`{username}` → nama user\n" +
            "`{userid}` → ID user\n" +
            "`{mention}` → mention user\n" +
            "`{server}` → nama server\n" +
            "`{membercount}` → total member\n" +
            "`{memberordinal}` → urutan member\n" +
            "`{joindate}` → durasi sejak join\n" +
            "`{created}` → durasi sejak akun dibuat\n" +
            "`{inviter}` → yang invite\n" +
            "`{invitecount}` → total invite\n" +
            "`{roles}` → daftar role user",
        },
        {
          name: "Catatan:",
          value:
            "• Placeholder pakai di greeting atau log\n" +
            "• Format durasi: `2 months, 3 days`\n" +
            "• Ordinal: `1st, 2nd, 3rd, 4th...`\n" +
            "• Total invite hanya hitung link yang digunakan\n" +
            "• Gunakan | untuk membuat judul dan isi fields: `Judul|Isi`\n" +
            "• Gunakan urutan untuk mengedit fields: `1 JudulBaru|IsiBaru`",
        },
      ],
    },
  ],
};

export default helpEmbeds;