# Interactive Competitive Radar Chart - Implementation Plan

## Vision
Overlay radar chart comparing user's product positioning vs main competitor across AI-generated competitive dimensions. As users define differentiating features, their overlay dynamically updates to show positioning gaps and opportunities.

## Reference Example Analysis
Your uploaded image shows:
- **Two overlays:** Cole Palmer (blue) vs Jude Bellingham (pink)
- **6-8 axes:** Key Passes, Prog. Passes, Dribbles%, Def. Actions, Carrying, Fwd. Passes%
- **Percentile scoring:** Each metric shows 0-100 percentile
- **Visual differentiation:** Color-coded fills with transparency for overlap visibility

## Annexa Application

### Competitive Dimensions for SaaS Products
Instead of football stats, use product positioning dimensions:

**Example Axes (AI-generated based on competitor):**
1. **Ease of Use** - How simple/complex the UX is
2. **Feature Depth** - Breadth of functionality
3. **Price Point** - Cost positioning (budget → premium)
4. **Customization** - Flexibility/configurability
5. **Onboarding Speed** - Time to first value
6. **Enterprise Ready** - Compliance, security, scale
7. **Design Quality** - UI/UX polish
8. **Performance** - Speed, reliability

The AI analyzes competitor website/positioning and suggests relevant axes for that specific market.

---

## Technical Architecture

### Option 1: Chart.js with chartjs-chart-radar (Recommended)
**Why:** Lightweight, well-documented, React-friendly

```bash
npm install chart.js react-chartjs-2
```

**Pros:**
- ✅ Built-in radar chart support
- ✅ Smooth animations
- ✅ Responsive by default
- ✅ Active ecosystem
- ✅ ~50KB bundle size

**Cons:**
- ⚠️ Limited customization compared to D3
- ⚠️ Harder to add interactive tooltips on axes

### Option 2: Recharts (Alternative)
**Why:** More React-native, declarative API

```bash
npm install recharts
```

**Pros:**
- ✅ React component-based
- ✅ Built-in radar chart
- ✅ Easy to customize colors/styles

**Cons:**
- ⚠️ Larger bundle (~100KB)
- ⚠️ Less documentation for radar charts

### Option 3: D3.js (Maximum Control)
**Why:** Full control over every pixel

**Pros:**
- ✅ Complete customization
- ✅ Advanced interactions
- ✅ Beautiful animations

**Cons:**
- ❌ Steep learning curve
- ❌ More code to maintain
- ❌ Harder to make responsive

**Recommendation:** **Chart.js** for speed, **D3** if you need custom interactions like draggable axes.

---

## AI Integration Strategy

### Phase 1: AI-Generated Competitive Axes

**Input to Gemini:**
```
User's Product: [productDescription]
Competitor URL: [competitorURL]
Competitor scraped content: [scrapedContent]

Generate 6-8 competitive dimensions that differentiate these products.
For each dimension:
1. Name (2-4 words)
2. Description (one sentence)
3. Scale definition (what low vs high means)

Format as JSON:
{
  "axes": [
    {
      "id": "ease_of_use",
      "name": "Ease of Use",
      "description": "How intuitive the product is for new users",
      "lowLabel": "Complex, steep learning curve",
      "highLabel": "Simple, instant clarity"
    },
    ...
  ]
}
```

**Gemini Prompt Template:**
```javascript
const generateCompetitiveAxes = async (userProduct, competitorData) => {
  const prompt = `You are analyzing competitive positioning for SaaS products.

USER'S PRODUCT:
${userProduct.description}
Target audience: ${userProduct.targetPersona}
Core value: ${userProduct.coreValue}

COMPETITOR:
Name: ${competitorData.name}
Website: ${competitorData.url}
Scraped content: ${competitorData.content}

TASK:
Generate 6-8 competitive dimensions that are:
1. Measurable or perceivable by customers
2. Relevant to this specific market
3. Differentiate these products meaningfully

For each dimension, provide:
- id: snake_case identifier
- name: Short label (2-4 words)
- description: One sentence explaining what this measures
- lowLabel: What a low score means (e.g., "Budget-friendly")
- highLabel: What a high score means (e.g., "Premium pricing")

Return ONLY valid JSON with this structure:
{
  "axes": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "lowLabel": "string",
      "highLabel": "string"
    }
  ]
}`;

  const result = await gemini.generateContent(prompt);
  return JSON.parse(result.response.text());
};
```

### Phase 2: AI-Scored Positioning

**Input to Gemini:**
```
Competitive Axes: [generatedAxes]
User's Product: [productDescription + differentiators]
Competitor: [competitorData]

For each axis, score both products on a 0-100 scale.
Consider: messaging, features, pricing, target audience, design.
```

**Scoring Prompt:**
```javascript
const scoreProducts = async (axes, userProduct, competitor) => {
  const prompt = `Score these two products on the following dimensions (0-100 scale):

DIMENSIONS:
${axes.map(axis => `- ${axis.name}: ${axis.description}`).join('\n')}

USER'S PRODUCT:
Description: ${userProduct.description}
Target audience: ${userProduct.targetPersona}
Key differentiators: ${userProduct.differentiators.join(', ')}
Pricing: ${userProduct.pricing}

COMPETITOR:
Name: ${competitor.name}
Description: ${competitor.description}
Messaging: ${competitor.messaging}
Pricing: ${competitor.pricing}

For each dimension, provide:
1. User's score (0-100)
2. Competitor's score (0-100)
3. Brief reasoning (one sentence)

Return ONLY valid JSON:
{
  "scores": [
    {
      "axisId": "string",
      "userScore": number,
      "competitorScore": number,
      "reasoning": "string"
    }
  ]
}`;

  const result = await gemini.generateContent(prompt);
  return JSON.parse(result.response.text());
};
```

### Phase 3: Dynamic Re-scoring

**User Flow:**
1. User sees initial radar chart (competitor vs basic user product)
2. User adds differentiating feature: "We focus on onboarding speed"
3. AI re-scores just the relevant axes (Onboarding Speed, Ease of Use)
4. Chart animates to new position

**Optimization:** Only re-score changed dimensions, cache unchanged scores.

```javascript
const updateScoresForDifferentiator = async (axes, currentScores, newDifferentiator) => {
  // Identify which axes are affected by this differentiator
  const affectedAxes = await identifyAffectedAxes(axes, newDifferentiator);
  
  // Only re-score those axes
  const updatedScores = await scoreProducts(
    affectedAxes, 
    { ...userProduct, differentiators: [...existing, newDifferentiator] },
    competitor
  );
  
  // Merge with cached scores
  return mergeScores(currentScores, updatedScores);
};
```

---

## Component Structure

### File Organization
```
src/components/competitive/
├── CompetitiveRadarChart.jsx       # Main chart component
├── RadarChartControls.jsx          # Add differentiators UI
├── AxisExplainer.jsx               # Hover tooltip for axes
├── ScoreBreakdown.jsx              # Table view of scores
└── hooks/
    ├── useCompetitiveAxes.js       # AI axis generation
    ├── useProductScoring.js        # AI scoring logic
    └── useChartAnimation.js        # Chart update animations
```

### Main Component Structure

```jsx
// src/components/competitive/CompetitiveRadarChart.jsx
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export function CompetitiveRadarChart({ 
  userProduct, 
  competitor, 
  onDifferentiatorAdd 
}) {
  const [axes, setAxes] = useState([]);
  const [scores, setScores] = useState({ user: [], competitor: [] });
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate axes on mount
  useEffect(() => {
    generateAxes();
  }, [competitor.url]);

  const generateAxes = async () => {
    setIsGenerating(true);
    const result = await generateCompetitiveAxes(userProduct, competitor);
    setAxes(result.axes);
    
    // Initial scoring
    const initialScores = await scoreProducts(result.axes, userProduct, competitor);
    setScores({
      user: initialScores.scores.map(s => s.userScore),
      competitor: initialScores.scores.map(s => s.competitorScore)
    });
    setIsGenerating(false);
  };

  const data = {
    labels: axes.map(axis => axis.name),
    datasets: [
      {
        label: competitor.name,
        data: scores.competitor,
        backgroundColor: 'rgba(236, 72, 153, 0.2)', // Pink with transparency
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(236, 72, 153, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(236, 72, 153, 1)',
      },
      {
        label: userProduct.name || 'Your Product',
        data: scores.user,
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue with transparency
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        beginAtZero: true,
        ticks: {
          stepSize: 20,
          display: false, // Hide tick labels for cleaner look
        },
        pointLabels: {
          font: {
            size: 12,
            family: 'Poppins, sans-serif',
          },
          color: '#a1a1aa', // zinc-400
        },
        grid: {
          color: 'rgba(161, 161, 170, 0.1)', // Subtle grid
        },
        angleLines: {
          color: 'rgba(161, 161, 170, 0.1)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: 'Poppins, sans-serif',
          },
          color: '#fafafa', // zinc-50
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const axisIndex = context[0].dataIndex;
            return axes[axisIndex]?.name || '';
          },
          label: (context) => {
            const axisIndex = context.dataIndex;
            const axis = axes[axisIndex];
            const score = context.parsed.r;
            return `${context.dataset.label}: ${score}/100`;
          },
          afterLabel: (context) => {
            const axisIndex = context.dataIndex;
            const axis = axes[axisIndex];
            return axis?.description || '';
          },
        },
      },
    },
  };

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#C24516] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-400">Analyzing competitive positioning...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="h-96">
        <Radar data={data} options={options} />
      </div>
      
      <RadarChartControls
        axes={axes}
        onDifferentiatorAdd={async (differentiator) => {
          // Re-score with new differentiator
          const updatedScores = await updateScoresForDifferentiator(
            axes,
            scores,
            differentiator
          );
          setScores(updatedScores);
          onDifferentiatorAdd?.(differentiator);
        }}
      />
      
      <ScoreBreakdown axes={axes} scores={scores} />
    </div>
  );
}
```

### Interactive Controls Component

```jsx
// src/components/competitive/RadarChartControls.jsx
export function RadarChartControls({ axes, onDifferentiatorAdd }) {
  const [newDifferentiator, setNewDifferentiator] = useState('');
  const [differentiators, setDifferentiators] = useState([]);

  const handleAdd = () => {
    if (!newDifferentiator.trim()) return;
    
    const differentiator = newDifferentiator.trim();
    setDifferentiators([...differentiators, differentiator]);
    onDifferentiatorAdd(differentiator);
    setNewDifferentiator('');
  };

  return (
    <div className="border border-zinc-800 rounded-lg p-6">
      <h3 className="font-serif text-xl mb-4">Define Your Differentiators</h3>
      <p className="text-zinc-400 text-sm mb-4">
        Add features or positioning points that set you apart. The chart will update to reflect your unique strengths.
      </p>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newDifferentiator}
          onChange={(e) => setNewDifferentiator(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="e.g., 'We focus on onboarding speed'"
          className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:border-[#C24516] outline-none"
        />
        <button
          onClick={handleAdd}
          className="px-6 py-2 bg-[#C24516] text-white rounded-lg hover:bg-[#A03814] transition-colors"
        >
          Add
        </button>
      </div>
      
      {differentiators.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Your Differentiators:</p>
          <div className="flex flex-wrap gap-2">
            {differentiators.map((diff, i) => (
              <div
                key={i}
                className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-sm flex items-center gap-2"
              >
                <span>{diff}</span>
                <button
                  onClick={() => {
                    const updated = differentiators.filter((_, idx) => idx !== i);
                    setDifferentiators(updated);
                    // TODO: Re-score without this differentiator
                  }}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Score Breakdown Table

```jsx
// src/components/competitive/ScoreBreakdown.jsx
export function ScoreBreakdown({ axes, scores }) {
  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-zinc-900">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">Dimension</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Competitor</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">You</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Gap</th>
          </tr>
        </thead>
        <tbody>
          {axes.map((axis, i) => {
            const competitorScore = scores.competitor[i];
            const userScore = scores.user[i];
            const gap = userScore - competitorScore;
            
            return (
              <tr key={axis.id} className="border-t border-zinc-800 hover:bg-zinc-900/50">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium">{axis.name}</div>
                    <div className="text-xs text-zinc-500">{axis.description}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-pink-400 font-semibold">{competitorScore}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-blue-400 font-semibold">{userScore}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={gap > 0 ? 'text-green-400' : gap < 0 ? 'text-red-400' : 'text-zinc-500'}>
                    {gap > 0 ? '+' : ''}{gap}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

---

## AI Function Implementation

### Backend Function: generateCompetitiveAxes

```typescript
// functions/generateCompetitiveAxes.ts
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";

export default async function handler(req: Request) {
  const { userProduct, competitor } = await req.json();
  
  const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `You are analyzing competitive positioning for SaaS products.

USER'S PRODUCT:
${userProduct.description}
Target audience: ${userProduct.targetPersona}

COMPETITOR:
Name: ${competitor.name}
Scraped content: ${competitor.content}

Generate 6-8 competitive dimensions that differentiate these products.
Each dimension must be:
1. Measurable or perceivable by customers
2. Relevant to this market
3. Meaningful for positioning

Return ONLY valid JSON:
{
  "axes": [
    {
      "id": "ease_of_use",
      "name": "Ease of Use",
      "description": "How intuitive the product is for new users",
      "lowLabel": "Complex learning curve",
      "highLabel": "Instant clarity"
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Strip markdown fences if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    const parsed = JSON.parse(cleaned);
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to parse AI response',
      rawText: text 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

### Backend Function: scoreProducts

```typescript
// functions/scoreCompetitivePosition.ts
export default async function handler(req: Request) {
  const { axes, userProduct, competitor, differentiators } = await req.json();
  
  const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `Score these products on competitive dimensions (0-100 scale).

DIMENSIONS:
${axes.map(axis => `- ${axis.name}: ${axis.description}`).join('\n')}

USER'S PRODUCT:
Description: ${userProduct.description}
Target: ${userProduct.targetPersona}
Differentiators: ${differentiators?.join(', ') || 'None yet'}

COMPETITOR:
Name: ${competitor.name}
Content: ${competitor.content}

For each dimension, score both products (0-100).
Consider messaging, features, target audience, pricing signals.

Return ONLY valid JSON:
{
  "scores": [
    {
      "axisId": "ease_of_use",
      "userScore": 75,
      "competitorScore": 60,
      "reasoning": "User emphasizes onboarding speed, competitor has complex setup"
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  const parsed = JSON.parse(cleaned);
  return new Response(JSON.stringify(parsed), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## Integration into CompetitiveIntelligence.jsx

```jsx
// src/components/CompetitiveIntelligence.jsx
import { CompetitiveRadarChart } from './competitive/CompetitiveRadarChart';

export function CompetitiveIntelligence({ formData }) {
  const [competitor, setCompetitor] = useState(null);
  const [differentiators, setDifferentiators] = useState([]);
  
  const handleAnalyze = async (competitorUrl) => {
    // Existing competitor scraping logic
    const scrapedData = await analyzeCompetitor(competitorUrl);
    setCompetitor(scrapedData);
  };
  
  return (
    <div className="space-y-8">
      {/* Existing competitor input UI */}
      
      {competitor && (
        <CompetitiveRadarChart
          userProduct={{
            description: formData.productDescription,
            targetPersona: formData.targetAudience,
            differentiators: differentiators,
          }}
          competitor={competitor}
          onDifferentiatorAdd={(diff) => {
            setDifferentiators([...differentiators, diff]);
          }}
        />
      )}
    </div>
  );
}
```

---

## Performance Optimizations

### Caching Strategy
```javascript
// Cache generated axes per competitor
const cacheKey = `axes_${md5(competitor.url)}`;
localStorage.setItem(cacheKey, JSON.stringify(axes));

// Cache scores per differentiator combination
const scoresCacheKey = `scores_${md5(competitor.url)}_${md5(differentiators.join(','))}`;
```

### Incremental Re-scoring
Instead of re-scoring all axes, only update affected ones:

```javascript
const affectedAxes = identifyAffectedAxes(newDifferentiator);
// Only re-score 1-3 axes instead of all 8
```

---

## Estimated Implementation Time

| Task | Time |
|------|------|
| Install Chart.js + setup | 15 min |
| Create RadarChart component | 30 min |
| Create Controls component | 20 min |
| Create ScoreBreakdown component | 20 min |
| AI function: generateAxes | 30 min |
| AI function: scoreProducts | 30 min |
| Integration + testing | 45 min |
| **Total** | **~3 hours** |

---

## Success Criteria

✅ Chart displays competitor vs user overlay  
✅ 6-8 AI-generated axes relevant to market  
✅ Scores update when differentiators added  
✅ Smooth animations on score changes  
✅ Table breakdown shows numeric gaps  
✅ Responsive on mobile  
✅ Caching prevents duplicate AI calls  

---

**Ready to implement?** This gives you a powerful competitive positioning visualization that updates dynamically as users refine their differentiation strategy.
