import express from "express";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 10000;

const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.use(cors({
  origin: "*"
}));

app.use(express.json({
  limit: "15mb"
}));


// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {

  res.json({
    status: "ok",
    service: "SPIDEREDGE AI Forex Scanner",
    strategy: "SPIDEREDGE 2.6 RANGE STRATEGY",
    ai: GROQ_API_KEY ? "configured" : "missing",
    symbol: "XAUUSD"
  });

});


// ===============================
// AI CHART ANALYSIS
// ===============================

app.post("/api/analyze-chart", async (req, res) => {

  try {

    if (!GROQ_API_KEY) {

      return res.status(500).json({
        error: "GROQ_API_KEY is not configured in Render."
      });

    }

    const { image, symbol } = req.body;

    if (!image) {

      return res.status(400).json({
        error: "No chart image was provided."
      });

    }

    if (
      symbol &&
      symbol.toUpperCase().replace(/[^A-Z]/g, "") !== "XAUUSD"
    ) {

      return res.status(400).json({
        error: "SPIDEREDGE AI is XAUUSD only."
      });

    }


    const systemPrompt = `

You are SPIDEREDGE AI.

You analyze XAUUSD forex/gold chart screenshots.

PRIMARY STRATEGY:

SPIDEREDGE 2.6 RANGE STRATEGY is the PRIMARY ENTRY FRAMEWORK.

Do NOT replace the strategy with RSI,
moving averages, MACD or another indicator.

Indicators and market structure may only be used
as confirmation and context.

TIMEFRAMES:

M30 = higher timeframe structure.

M15 = confirmation.

M5 = entry timing.

ANALYSIS:

Identify the visible range high.

Identify the visible range low.

Calculate:

Range = High - Low

Distance = Range / 2.6

Do not round the range before calculating distance.

Evaluate:

- bullish/bearish structure
- HH
- HL
- LH
- LL
- liquidity
- momentum
- volatility
- support/resistance
- possible breakout
- rejection
- entry location

DECISION:

BUY only when the chart provides enough evidence
for a bullish setup.

SELL only when the chart provides enough evidence
for a bearish setup.

WAIT when the evidence is incomplete,
conflicting or invalid.

Never invent prices that cannot be reasonably
read from the screenshot.

Never guarantee profit.

Explain clearly WHY the decision was made.

Return the result as JSON only.

`;


    const userPrompt = `

Analyze this XAUUSD chart.

I want:

1. BUY / SELL / WAIT

2. Confidence percentage

3. M30 analysis

4. M15 analysis

5. M5 analysis

6. SPIDEREDGE 2.6 range high

7. SPIDEREDGE 2.6 range low

8. Range size

9. Distance divided by 2.6

10. Entry

11. Stop loss

12. TP1

13. TP2

14. Risk reward

15. Market bias

16. Structure

17. Liquidity

18. Momentum

19. Volatility

20. Detailed reasons for the trade

21. Invalidation conditions

If the screenshot does not contain enough information,
return WAIT rather than guessing.

`;


    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {

        method: "POST",

        headers: {

          "Authorization": `Bearer ${GROQ_API_KEY}`,

          "Content-Type": "application/json"

        },

        body: JSON.stringify({

          model: "meta-llama/llama-4-scout-17b-16e-instruct",

          temperature: 0.1,

          max_tokens: 2500,

          messages: [

            {
              role: "system",
              content: systemPrompt
            },

            {
              role: "user",

              content: [

                {
                  type: "text",
                  text: userPrompt
                },

                {
                  type: "image_url",

                  image_url: {
                    url: image
                  }

                }

              ]

            }

          ]

        })

      }
    );


    const data = await response.json();


    if (!response.ok) {

      console.error(data);

      return res.status(500).json({

        error:
          data?.error?.message ||
          "Groq AI analysis failed."

      });

    }


    const aiText =
      data?.choices?.[0]?.message?.content || "";


    res.json({

      status: "ok",

      scanner: "SPIDEREDGE AI Forex Scanner",

      strategy: "SPIDEREDGE 2.6 RANGE STRATEGY",

      symbol: "XAUUSD",

      analysis: aiText

    });


  } catch (error) {

    console.error(error);

    res.status(500).json({

      error:
        error?.message ||
        "Unable to analyze chart."

    });

  }

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

  console.log(
    `SPIDEREDGE AI server running on port ${PORT}`
  );

});
