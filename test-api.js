async function testSaveAPI() {
    console.log("Testing Save API...");
    try {
        const res = await fetch('http://localhost:3000/api/exams/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                examData: {
                    title: "Teste API",
                    questions: [{ text: "Questão teste", type: "text" }],
                    teacherId: "test-system",
                    createdAt: new Date()
                }
            })
        });
        const data = await res.json();
        console.log("Response Status:", res.status);
        console.log("Response Data:", data);
    } catch (error) {
        console.error("Fetch failed:", error.message);
    }
}

testSaveAPI();
