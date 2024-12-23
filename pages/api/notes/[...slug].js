export default async function handler(req, res) {
    const { slug } = req.query;
    const method = req.method;
    const baseUrl = "https://service.pace-unv.cloud/api/notes";

    try {
        const apiUrl = `${baseUrl}/${slug.join("/")}`;
        const options = {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req.body),
        };

        const response = await fetch(apiUrl, options);
        const data = await response.json();

        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}
