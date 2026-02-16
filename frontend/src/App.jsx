import { useState, useEffect } from "react"
import { supabase } from "./supabase"

function App() {

  const [page, setPage] = useState("landing")
  const [role, setRole] = useState(null)
  const [userName, setUserName] = useState("")
  const [selectedGem, setSelectedGem] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // ✅ AUTO RESTORE SESSION ON LOAD
useEffect(() => {

  const checkSession = async () => {

    const { data: { session } } = await supabase.auth.getSession()

    // If user is logged in normally
    if (session?.user) {
      setIsAuthenticated(true)
      setUserName(session.user.user_metadata?.full_name || "")
    }

    // Detect password recovery session
    if (session && window.location.hash.includes("type=recovery")) {
      setPage("updatePassword")
    }

  }

  checkSession()

}, [])


  // ✅ LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setUserName("")
    setPage("landing")
    setRole(null)
    setSelectedGem(null)
  }

  /* -------- ROUTING LOGIC -------- */

  if (page === "signup" || page === "login") {
    return (
      <AuthPage
        mode={page}
        goToLogin={() => setPage("login")}
        goToSignup={() => setPage("signup")}
        goHome={() => setPage("landing")}
        onSuccess={async () => {
          const { data } = await supabase.auth.getUser()

          if (data?.user) {
            setIsAuthenticated(true)
            setUserName(data.user.user_metadata?.full_name || "")
          }

          setPage("roles")
        }}
        goToReset={() => setPage("reset")} 
      />
    )
  }

  if (page === "reset") {
  return (
    <ResetPasswordPage
      goToLogin={() => setPage("login")}
    />
  )
}
  if (page === "updatePassword") {
  return (
    <UpdatePasswordPage
      goToLogin={() => setPage("login")}
    />
  )
}

  if (page === "roles") {
    return (
      <RoleSelection
        userName={userName}
        isAuthenticated={isAuthenticated}
        onEnter={(selectedRole) => {
          setRole(selectedRole)
          setPage("dashboard")
        }}
        onLogout={handleLogout}
        onBack={() => setPage("landing")}
      />
    )
  }

  if (page === "dashboard") {
    return (
      <RoleDashboard
        role={role}
        isAuthenticated={isAuthenticated}
        userName={userName}
        onLogout={handleLogout}
        onOpen={(gemName) => {
          setSelectedGem(gemName)
          setPage("gem")
        }}
        onBack={() => setPage("roles")}
      />
    )
  }

  if (page === "gem") {
    return (
      <GemScreen
        role={role}
        gem={selectedGem}
        onBack={() => setPage("dashboard")}
      isAuthenticated={isAuthenticated}
      userName={userName}
      onLogout={handleLogout}
      />
    )
  }

  return (
    <LandingPage
      onStart={() => setPage("roles")}
      goLogin={() => setPage("login")}
      goSignup={() => setPage("signup")}
      isAuthenticated={isAuthenticated}
      userName={userName}
      onLogout={handleLogout}
    />
  )
}

export default App

function LandingPage({ 
  onStart, 
  goLogin, 
  goSignup, 
  isAuthenticated, 
  userName, 
  onLogout 
}) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">

      <div className="flex justify-between items-center px-8 py-4 relative">

        <h1 className="text-2xl font-bold text-emerald-700">
          BioGenie
        </h1>

        {!isAuthenticated ? (

          <div className="flex gap-3">
            <button
              onClick={goLogin}
              className="px-4 py-2 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition"
            >
              Sign In
            </button>

            <button
              onClick={goSignup}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              Sign Up
            </button>
          </div>

        ) : (

          <ProfileDropdown
            userName={userName}
            onLogout={onLogout}
          />

        )}

      </div>

      <div className="flex flex-col items-center justify-center text-center px-6 py-24">

        <h1 className="text-6xl font-bold text-emerald-700 mb-6">
          BioGenie
        </h1>

        <p className="max-w-xl text-lg text-gray-700 mb-10">
          A personalized biotechnology learning assistant designed for students,
          teachers, and the public. Curriculum aligned and rural friendly.
        </p>

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

function ProfileDropdown({ userName, onLogout }) {
  const [open, setOpen] = useState(false)

  const firstLetter = userName ? userName.charAt(0).toUpperCase() : "U"

  return (
    <div className="relative flex justify-end">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
      >
        <div className="w-7 h-7 bg-white text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">
          {firstLetter}
        </div>

        <span>{userName}</span>
        <span className="text-sm">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-2xl rounded-xl border border-gray-200">
          <div className="px-4 py-3 text-sm border-b text-gray-600">
            Signed in as
            <div className="font-semibold text-gray-800">
              {userName}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}





// ================= AUTH PAGE =================

function AuthPage({ mode, goToLogin, goToSignup, goHome, onSuccess, goToReset }) {

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async () => {

    if (!email || !password || (mode === "signup" && !fullName)) {
      setError("Please fill all fields")
      return
    }

    try {

      if (mode === "signup") {

        const { error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: fullName
            }
          }
        })

        if (error) throw error

        alert("Account created successfully! Please login.")
        goToLogin()
      }

      if (mode === "login") {

        const { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        })

        if (error) throw error

        onSuccess()
      }

    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">

      <div className="bg-white p-10 rounded-2xl shadow-xl w-[420px]">

        <button onClick={goHome} className="text-sm text-gray-500 mb-4">
          ← Back
        </button>

        <h2 className="text-3xl font-bold text-emerald-700 text-center mb-8">
          {mode === "signup" ? "Create Account" : "Welcome Back"}
        </h2>

        {mode === "signup" && (
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg mb-4"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded-lg mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded-lg mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* ✅ STEP 3 — Forgot Password Link (Login Only) */}
        {mode === "login" && (
          <div className="text-right text-sm mb-4">
            <span
              onClick={goToReset}
              className="text-emerald-600 cursor-pointer hover:underline"
            >
              Forgot Password?
            </span>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition"
        >
          {mode === "signup" ? "Sign Up" : "Sign In"}
        </button>

        <div className="text-center mt-6 text-sm">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <span onClick={goToLogin} className="text-emerald-600 cursor-pointer">
                Sign In
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span onClick={goToSignup} className="text-emerald-600 cursor-pointer">
                Sign Up
              </span>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

function ResetPasswordPage({ goBack }) {

  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleReset = async () => {
    if (!email) {
      setError("Please enter your email")
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173"
    })

    if (error) {
      setError(error.message)
    } else {
      setError("")
      setMessage("Password reset link sent to your email.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">

      <div className="bg-white p-10 rounded-2xl shadow-xl w-[420px]">

        <button onClick={goBack} className="text-sm text-gray-500 mb-4">
          ← Back to Login
        </button>

        <h2 className="text-3xl font-bold text-emerald-700 text-center mb-8">
          Reset Password
        </h2>

        <input
          type="email"
          placeholder="Enter your registered email"
          className="w-full p-3 border rounded-lg mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        {message && (
          <p className="text-green-600 text-sm mb-4 text-center">
            {message}
          </p>
        )}

        <button
          onClick={handleReset}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition"
        >
          Send Reset Link
        </button>

      </div>
    </div>
  )
}

function UpdatePasswordPage({ goToLogin }) {

  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleUpdate = async () => {
    if (!newPassword) {
      setError("Please enter a new password")
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      setError(error.message)
    } else {
      setError("")
      setMessage("Password updated successfully! Please login.")
      setTimeout(() => {
        goToLogin()
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">

      <div className="bg-white p-10 rounded-2xl shadow-xl w-[420px]">

        <h2 className="text-3xl font-bold text-emerald-700 text-center mb-8">
          Set New Password
        </h2>

        <input
          type="password"
          placeholder="Enter new password"
          className="w-full p-3 border rounded-lg mb-4"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        {message && (
          <p className="text-green-600 text-sm mb-4 text-center">
            {message}
          </p>
        )}

        <button
          onClick={handleUpdate}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition"
        >
          Update Password
        </button>

      </div>
    </div>
  )
}

/* ---------------- Role Selection ---------------- */

function RoleSelection({ onEnter, userName, isAuthenticated, onLogout, onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-10">

      {/* ---------- TOP BAR ---------- */}
      <div className="flex justify-between items-center mb-8">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
          >
            ← Back
          </button>

          <h2 className="text-4xl font-bold text-emerald-700">
            Choose Your Role
          </h2>
        </div>

        {/* RIGHT SIDE */}
        {isAuthenticated && (
          <ProfileDropdown
            userName={userName}
            onLogout={onLogout}
          />
        )}

      </div>

      {/* ---------- ROLE GRID ---------- */}
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

function RoleDashboard({ role, onOpen, onBack, isAuthenticated, onLogout, userName }) {

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
    <div className="flex items-center gap-4">
    <button
      onClick={onBack}
      className="bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
    >
      ← Back
    </button>

    <h2 className="text-4xl font-bold text-emerald-700">
      {role?.toUpperCase()} DASHBOARD
    </h2>
  </div>

  {isAuthenticated && (
    <ProfileDropdown
      userName={userName}
      onLogout={onLogout}
    />
  )}
      


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

function GemScreen({ role, gem, onBack, isAuthenticated, userName, onLogout }) {

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

      {/* ---------- HEADER ---------- */}
<div className="w-full flex items-center mb-6">

  {/* LEFT SIDE */}
  <div className="flex items-center gap-4">
    <button
      onClick={onBack}
      className="bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
    >
      ← Back
    </button>

    <h2 className="text-2xl font-bold text-emerald-700">
      {gem}
    </h2>
  </div>

  {/* RIGHT SIDE */}
  {isAuthenticated && (
    <div className="ml-auto flex items-center">
      <ProfileDropdown
        userName={userName}
        onLogout={onLogout}
      />
    </div>
  )}

</div>


      {/* ---------- CHAT BOX ---------- */}
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

      {/* ---------- INPUT ---------- */}
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
