import { useState } from "react"

function App() {

  const [page, setPage] = useState("landing")
  const [role, setRole] = useState(null)
  const [selectedGem, setSelectedGem] = useState(null)


  /* -------- ROUTING LOGIC -------- */

  if (page === "roles") {
    return (
      <RoleSelection
        onEnter={(selectedRole) => {
          setRole(selectedRole)
          setPage("dashboard")
        }}
      />
    )
  }

  if (page === "dashboard") {
    return (
      <RoleDashboard
        role={role}
        onOpen={(gemName) => {
          setSelectedGem(gemName)
          setPage("gem")
        }}
      />
    )
  }

  if (page === "gem") {
    return (
      <GemScreen
        role={role}
        gem={selectedGem}
        onBack={() => setPage("dashboard")}
      />
    )
  }

  return <LandingPage onStart={() => setPage("roles")} />
}

export default App


/* ---------------- Landing ---------------- */

function LandingPage({ onStart }) {
  return (

    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">

      {/* ---------- NAVBAR ---------- */}
      <div className="flex justify-between items-center px-8 py-4">

        {/* Logo */}
        <h1 className="text-2xl font-bold text-emerald-700">
          BioGenie
        </h1>

        {/* Auth Buttons */}
        <div className="flex gap-3">

          <button
            onClick={() => alert("Sign In page will come later")}
            className="px-4 py-2 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition"
          >
            Sign In
          </button>

          <button
            onClick={() => alert("Sign Up page will come later")}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            Sign Up
          </button>

        </div>
      </div>


      {/* ---------- HERO SECTION ---------- */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-24">

        <h1 className="text-6xl font-bold text-emerald-700 mb-6">
          BioGenie
        </h1>

        <p className="max-w-xl text-lg text-gray-700 mb-10">
          A personalized biotechnology learning assistant designed for students,
          teachers, and the public. Curriculum aligned and rural friendly.
        </p>

        {/* Guest Mode */}
        <button
          onClick={onStart}
          className="bg-emerald-600 text-white px-10 py-4 rounded-xl text-lg shadow-lg hover:bg-emerald-700 transition"
        >
          Continue as Guest
        </button>

      </div>

    </div>
  )
}



/* ---------------- Role Selection ---------------- */

function RoleSelection({ onEnter }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-10">

      <h2 className="text-4xl font-bold text-center text-emerald-700 mb-12">
        Choose Your Role
      </h2>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

        <RoleCard
          title="Student"
          desc="Notes, Exams, Concept Help"
          img="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
          onClick={() => onEnter("student")}
        />

        <RoleCard
          title="Teacher"
          desc="Lesson Plans, Question Papers, Analytics"
          img="https://cdn-icons-png.flaticon.com/512/3135/3135789.png"
          onClick={() => onEnter("teacher")}
        />

        <RoleCard
          title="Public"
          desc="Biotech Awareness, Real Life Applications"
          img="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
          onClick={() => onEnter("public")}
        />

        <RoleCard
          title="Labs"
          desc="Virtual Labs, Simulations, Experiment Guidance"
          img="https://cdn-icons-png.flaticon.com/512/2784/2784487.png"
          onClick={() => onEnter("labs")}
        />

      </div>
    </div>
  )
}


/* ---------------- Role Card ---------------- */

function RoleCard({ title, desc, img, onClick }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg text-center flex flex-col items-center justify-between">

      <img src={img} className="w-24 h-24 mb-4" />

      <h3 className="text-2xl font-semibold text-emerald-700 mb-3">{title}</h3>

      <p className="text-gray-600 mb-6">{desc}</p>

      <button
        onClick={onClick}
        className="bg-emerald-600 text-white px-6 py-2 rounded-lg w-full"
      >
        Select
      </button>

    </div>
  )
}


/* ---------------- Dashboard ---------------- */

function RoleDashboard({ role, onOpen }) {

  const dashboards = {

    student: [
      { title: "PPT Maker", img: "https://cdn-icons-png.flaticon.com/512/888/888879.png" },
      { title: "Notes Generator", img: "https://cdn-icons-png.flaticon.com/512/2921/2921222.png" },
      { title: "Summarizer", img: "https://cdn-icons-png.flaticon.com/512/2991/2991108.png" },
      { title: "Story Generation", img: "https://cdn-icons-png.flaticon.com/512/3145/3145765.png" },
      { title: "Exam Preparation", img: "https://cdn-icons-png.flaticon.com/512/3135/3135755.png" },
      { title: "Previous Year Question Paper", img: "https://cdn-icons-png.flaticon.com/512/3239/3239952.png" },
      { title: "Timetable Generator", img: "https://cdn-icons-png.flaticon.com/512/747/747310.png" },
      { title: "Doubt Solver", img: "https://cdn-icons-png.flaticon.com/512/4712/4712027.png" },
      { title: "Diagram Generator", img: "https://cdn-icons-png.flaticon.com/512/2103/2103633.png" }
    ],

    teacher: [
      { title: "Lesson Plan Generator", img: "https://cdn-icons-png.flaticon.com/512/3135/3135789.png" },
      { title: "Question Paper Generator", img: "https://cdn-icons-png.flaticon.com/512/2920/2920277.png" },
      { title: "Answer Key Generator", img: "https://cdn-icons-png.flaticon.com/512/190/190411.png" },
      { title: "PPT Maker", img: "https://cdn-icons-png.flaticon.com/512/888/888879.png" },
      { title: "Assignment Generator", img: "https://cdn-icons-png.flaticon.com/512/1828/1828919.png" },
      { title: "Student Performance Analyzer", img: "https://cdn-icons-png.flaticon.com/512/1828/1828911.png" },
      { title: "Doubt Clearance", img: "https://cdn-icons-png.flaticon.com/512/4712/4712027.png" },
      { title: "Interactive Session For Students", img: "https://cdn-icons-png.flaticon.com/512/3063/3063825.png" }
    ],

    public: [
      { title: "Biotech Awareness", img: "https://cdn-icons-png.flaticon.com/512/2784/2784487.png" },
      { title: "Biotech in Daily Life", img: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png" },
      { title: "Health & Medicine Biotech", img: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png" },
      { title: "Agriculture Biotech", img: "https://cdn-icons-png.flaticon.com/512/2909/2909762.png" },
      { title: "News Simplifier", img: "https://cdn-icons-png.flaticon.com/512/2965/2965879.png" }
    ],

    labs: [
      { title: "Virtual Lab Experiments", img: "https://cdn-icons-png.flaticon.com/512/2784/2784487.png" },
      { title: "Biotech Simulations", img: "https://cdn-icons-png.flaticon.com/512/4149/4149676.png" },
      { title: "Step by Step Experiment Guide", img: "https://cdn-icons-png.flaticon.com/512/1828/1828817.png" },
      { title: "Safety Training", img: "https://cdn-icons-png.flaticon.com/512/2913/2913465.png" },
      { title: "Lab Viva Preparation", img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }
    ]

  }

  const items = dashboards[role] || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-10">

      <h2 className="text-4xl font-bold text-center text-emerald-700 mb-12">
        {role?.toUpperCase()} DASHBOARD
      </h2>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition flex flex-col items-center"
          >

            <img src={item.img} className="w-16 h-16 mb-4" />

            <h3 className="text-lg font-semibold text-emerald-700 mb-4">
              {item.title}
            </h3>

            <button
              onClick={() => onOpen(item.title)}
              className="mt-auto bg-emerald-600 text-white px-6 py-2 rounded-lg w-full"
            >
              Open
            </button>

          </div>
        ))}

      </div>

    </div>
  )
}


/* ---------------- Gem Screen ---------------- */

function GemScreen({ role, gem, onBack }) {

  const [messages, setMessages] = useState([
    { sender: "bot", text: `Welcome to ${gem}! Ask me anything.` }
  ])

  const [input, setInput] = useState("")

  const sendMessage = () => {
    if (!input.trim()) return

    const newMessages = [
      ...messages,
      { sender: "user", text: input },
      { sender: "bot", text: "AI response will come here later 🤖" }
    ]

    setMessages(newMessages)
    setInput("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="bg-white px-4 py-2 rounded-lg shadow"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold text-emerald-700">
          {gem}
        </h2>

        <div></div>
      </div>

      {/* Chat Box */}
      <div className="flex-1 bg-white rounded-2xl shadow p-4 overflow-y-auto mb-4">

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-xl max-w-xs ${
                msg.sender === "user"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask something in ${gem}...`}
          className="flex-1 p-3 rounded-xl border"
        />

        <button
          onClick={sendMessage}
          className="bg-emerald-600 text-white px-6 rounded-xl"
        >
          Send
        </button>
      </div>

    </div>
  )
}

