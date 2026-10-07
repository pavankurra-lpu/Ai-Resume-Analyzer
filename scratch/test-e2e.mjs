import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== Starting Complete End-to-End Test Suite ===\n");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const testEmail = `tester${randomSuffix}@learnerstrack.com`;
  const simulatedIp = `192.168.1.${(randomSuffix % 240) + 10}`;

  const jsonHeaders = {
    "Content-Type": "application/json",
    "x-forwarded-for": simulatedIp,
  };

  // 1. Landing Page
  console.log("[1/14] Testing Landing Page GET / ...");
  let res = await fetch(`${BASE_URL}/`);
  if (!res.ok) throw new Error(`Landing page failed: ${res.status}`);
  console.log("   -> OK (200)");

  // 2. Check Page
  console.log("[2/14] Testing Check Page GET /check ...");
  res = await fetch(`${BASE_URL}/check`);
  if (!res.ok) throw new Error(`Check page failed: ${res.status}`);
  console.log("   -> OK (200)");

  // 3. Privacy Page
  console.log("[3/14] Testing Privacy Page GET /privacy ...");
  res = await fetch(`${BASE_URL}/privacy`);
  if (!res.ok) throw new Error(`Privacy page failed: ${res.status}`);
  console.log("   -> OK (200)");

  // 4. Analyze / Submit Resume via FormData
  console.log(`[4/14] Testing POST /api/analyze for ${testEmail} ...`);
  const resumeText = `
Name: Arun Kumar
Email: ${testEmail}
Phone: 9876543210
Target Role: Full Stack Developer
Education: Anna University, B.Tech CSE, 2024. CGPA: 8.2
Experience:
- Intern at Alpha Tech. Worked on frontend components and fixed bugs in web portal.
Projects:
- Job Portal: Created application using React, Node.js, Express, and MongoDB.
Skills: JavaScript, TypeScript, React, Node.js, Python, SQL, Git.
  `.trim();

  const fd = new FormData();
  fd.append("resumeText", resumeText);
  fd.append("name", "Arun Kumar");
  fd.append("phone", "9876543210");
  fd.append("email", testEmail);
  fd.append("collegeOrCompany", "Anna University");
  fd.append("experienceLevel", "Fresher");
  fd.append("targetRole", "Full Stack Developer");
  fd.append("jobDescription", "Looking for a full stack engineer proficient in React, Node.js, and TypeScript with good problem solving skills.");
  fd.append("consent", "true");

  res = await fetch(`${BASE_URL}/api/analyze`, {
    method: "POST",
    headers: {
      "x-forwarded-for": simulatedIp,
    },
    body: fd,
  });

  const analyzeData = await res.json();
  if (!res.ok || !analyzeData.reportId) {
    throw new Error(`Analyze failed: ${JSON.stringify(analyzeData)}`);
  }
  const reportId = analyzeData.reportId;
  console.log(`   -> OK! Created Report ID: ${reportId}`);

  // 5. Verify Report Page
  console.log(`[5/14] Testing Report Page GET /report/${reportId} ...`);
  res = await fetch(`${BASE_URL}/report/${reportId}`);
  if (!res.ok) throw new Error(`Report page failed: ${res.status}`);
  console.log("   -> OK (200)");

  // 6. Parse Resume into Structured Format
  console.log(`[6/14] Testing POST /api/resume/parse for report ${reportId} ...`);
  res = await fetch(`${BASE_URL}/api/resume/parse`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ reportId }),
  });
  const parseData = await res.json();
  if (!res.ok || !parseData.resumeId) {
    throw new Error(`Parse failed: ${JSON.stringify(parseData)}`);
  }
  const resumeId = parseData.resumeId;
  console.log(`   -> OK! Created Structured Resume ID: ${resumeId}`);

  // 7. Autosave / Patch Resume
  console.log(`[7/14] Testing PATCH /api/resume/${resumeId} with updated bullets ...`);
  const updatedContent = {
    ...parseData.content,
    experience: [
      {
        company: "Alpha Tech",
        role: "Full Stack Intern",
        startDate: "Jan 2024",
        endDate: "Jun 2024",
        bullets: [
          "Engineered 14 responsive React components, reducing dashboard load times by 32%.",
          "Optimized backend MongoDB aggregation queries handling 25,000+ daily requests.",
        ],
      },
    ],
  };

  res = await fetch(`${BASE_URL}/api/resume/${resumeId}`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({
      content: updatedContent,
      templateId: "modern",
      explanationLanguage: "en",
    }),
  });
  const patchData = await res.json();
  if (!res.ok || !patchData.success) {
    throw new Error(`Patch failed: ${JSON.stringify(patchData)}`);
  }
  console.log("   -> OK! Resume autosaved successfully.");

  // 8. AI Coach Suggestions (Multilingual en / hi / te)
  console.log(`[8/14] Testing POST /api/resume/${resumeId}/suggest in English and Hindi ...`);
  res = await fetch(`${BASE_URL}/api/resume/${resumeId}/suggest`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      rawBullet: "worked on frontend bugs and improved website",
      language: "en",
    }),
  });
  const suggestEn = await res.json();
  if (!res.ok || !suggestEn.rewrite) {
    throw new Error(`Suggest EN failed: ${JSON.stringify(suggestEn)}`);
  }
  console.log(`   -> OK (EN): "${suggestEn.rewrite}"`);

  res = await fetch(`${BASE_URL}/api/resume/${resumeId}/suggest`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      rawBullet: "worked on frontend bugs and improved website",
      language: "hi",
    }),
  });
  const suggestHi = await res.json();
  if (!res.ok || !suggestHi.whyRecruitersCare) {
    throw new Error(`Suggest HI failed: ${JSON.stringify(suggestHi)}`);
  }
  console.log(`   -> OK (HI Explanation): "${suggestHi.whyRecruitersCare}"`);

  // 9. Rescore Resume
  console.log(`[9/14] Testing POST /api/resume/${resumeId}/rescore ...`);
  res = await fetch(`${BASE_URL}/api/resume/${resumeId}/rescore`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      content: updatedContent,
      targetRole: "Full Stack Developer",
    }),
  });
  const rescoreData = await res.json();
  if (!rescoreData.overallScore) {
    throw new Error(`Rescore failed: ${JSON.stringify(rescoreData)}`);
  }
  console.log(`   -> OK! Before: ${rescoreData.previousScore} -> After: ${rescoreData.overallScore}`);

  // 10. Server-Side DOCX Export
  console.log(`[10/14] Testing GET /api/resume/${resumeId}/export?format=docx ...`);
  res = await fetch(`${BASE_URL}/api/resume/${resumeId}/export?format=docx`);
  if (!res.ok) throw new Error(`DOCX export failed: ${res.status}`);
  const docxBlob = await res.arrayBuffer();
  console.log(`   -> OK! Downloaded DOCX size: ${docxBlob.byteLength} bytes`);

  // 11. Server-Side PDF Export
  console.log(`[10b/14] Testing GET /api/resume/${resumeId}/export?format=pdf ...`);
  res = await fetch(`${BASE_URL}/api/resume/${resumeId}/export?format=pdf`);
  if (!res.ok) throw new Error(`PDF export failed: ${res.status}`);
  const pdfBlob = await res.arrayBuffer();
  console.log(`   -> OK! Downloaded PDF size: ${pdfBlob.byteLength} bytes`);

  // 12. Email Dispatch with Attachments
  console.log(`[11/14] Testing POST /api/resume/${resumeId}/email ...`);
  res = await fetch(`${BASE_URL}/api/resume/${resumeId}/email`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      toEmail: testEmail,
      emailConfirmed: true,
      scoreBefore: 70,
      scoreAfter: 70,
    }),
  });
  const emailData = await res.json();
  if (!res.ok || !emailData.success) {
    throw new Error(`Email failed: ${JSON.stringify(emailData)}`);
  }
  console.log(`   -> OK! Email status: ${emailData.status}, Message: ${emailData.message}`);

  const outboxDir = path.resolve("./outbox");
  if (fs.existsSync(outboxDir)) {
    const files = fs.readdirSync(outboxDir);
    console.log(`   -> Outbox files written: ${files.length} items`);
  }

  // 13. Admin Dashboard & Login
  console.log("[12/14] Testing Admin login & leads query ...");
  res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ password: "admin123" }),
  });
  const loginCookie = res.headers.get("set-cookie");
  if (!loginCookie) throw new Error("Admin login did not return session cookie");

  const adminHeaders = {
    ...jsonHeaders,
    cookie: loginCookie.split(";")[0],
  };

  res = await fetch(`${BASE_URL}/api/admin/leads?search=${encodeURIComponent(testEmail)}`, {
    headers: adminHeaders,
  });
  const leadsData = await res.json();
  const leadEntry = leadsData.leads?.find((l) => l.email === testEmail);
  if (!leadEntry) throw new Error("Test lead not found in admin response");
  console.log(`   -> OK! Found Lead: ${leadEntry.name}`);
  console.log(`   -> Resume Status: ${leadEntry.resumeStatus}`);
  console.log(`   -> Score Before -> After: ${leadEntry.scoreBeforeToAfter?.label}`);
  console.log(`   -> Call Script Tip: ${leadEntry.callScriptTip}`);

  // 14. Self-Service Data Deletion
  console.log(`[13/14] Testing Self-Service Data Deletion for ${testEmail} ...`);
  res = await fetch(`${BASE_URL}/api/user/delete-data`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email: testEmail }),
  });
  const deleteData = await res.json();
  if (!deleteData.success) {
    throw new Error(`Delete failed: ${JSON.stringify(deleteData)}`);
  }
  console.log(`   -> OK! Deleted ${deleteData.deletedCount} lead record(s)`);

  res = await fetch(`${BASE_URL}/api/admin/leads?search=${encodeURIComponent(testEmail)}`, {
    headers: adminHeaders,
  });
  const checkDeleted = await res.json();
  const stillExists = checkDeleted.leads?.some((l) => l.email === testEmail);
  if (stillExists) throw new Error("Lead still exists after deletion!");
  console.log("   -> Verified: Lead is completely erased from database.");

  // 15. Cron Cleanup Job
  console.log("[14/14] Testing Retention Cleanup Job POST /api/cron/cleanup ...");
  res = await fetch(`${BASE_URL}/api/cron/cleanup`, { method: "POST", headers: jsonHeaders });
  const cronData = await res.json();
  if (!cronData.success) {
    throw new Error(`Cron cleanup failed: ${JSON.stringify(cronData)}`);
  }
  console.log(`   -> OK! Retention job executed: ${cronData.message}`);

  console.log("\n=======================================================");
  console.log("🎉 ALL 14 END-TO-END INTEGRATION TESTS PASSED 100%! 🎉");
  console.log("=======================================================");
}

runTests().catch((err) => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
