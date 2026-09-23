"use client";

import { useState, useMemo } from "react";
import {
  ScannedFoodItem,
  MealLog,
  DailyNutritionSummary,
} from "@/lib/Welbeing/WelbeingTypes";
import {
  ETHIOPIAN_FOOD_DATABASE,
  searchFoodDatabase,
  generateDailySummary,
} from "@/lib/Welbeing/foodTrackingEngine";

type MealType = MealLog["mealType"];

const MEAL_TYPE_LABELS: Record<MealType, { label: string; icon: string; color: string }> = {
  breakfast: { label: "Breakfast", icon: "🌅", color: "text-amber-400" },
  lunch: { label: "Lunch", icon: "☀️", color: "text-yellow-400" },
  dinner: { label: "Dinner", icon: "🌙", color: "text-violet-400" },
  snack: { label: "Snack", icon: "🍃", color: "text-emerald-400" },
  coffee_ceremony: { label: "Coffee Ceremony", icon: "☕", color: "text-amber-600" },
};

const SEVERITY_STYLES = {
  adequate: { bar: "bg-emerald-500", text: "text-emerald-400", label: "✓ Adequate" },
  mild_gap: { bar: "bg-amber-500", text: "text-amber-400", label: "~ Mild Gap" },
  moderate_gap: { bar: "bg-orange-500", text: "text-orange-400", label: "! Moderate Gap" },
  severe_gap: { bar: "bg-rose-500", text: "text-rose-400", label: "✗ Severe Gap" },
};

export default function FoodTrackingView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch");
  const [currentMealItems, setCurrentMealItems] = useState<{ food: ScannedFoodItem; servings: number }[]>([]);
  const [allMealLogs, setAllMealLogs] = useState<MealLog[]>([]);
  const [activeTab, setActiveTab] = useState<"add" | "log" | "summary">("add");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const searchResults = useMemo(() => {
    if (!searchQuery && filterCategory === "all") return ETHIOPIAN_FOOD_DATABASE.slice(0, 8);
    let results = searchQuery ? searchFoodDatabase(searchQuery) : ETHIOPIAN_FOOD_DATABASE;
    if (filterCategory !== "all") {
      results = results.filter((f) => f.category === filterCategory);
    }
    return results.slice(0, 10);
  }, [searchQuery, filterCategory]);

  const addFoodToMeal = (food: ScannedFoodItem) => {
    setCurrentMealItems((prev) => {
      const existing = prev.find((i) => i.food.id === food.id);
      if (existing) {
        return prev.map((i) => i.food.id === food.id ? { ...i, servings: i.servings + 1 } : i);
      }
      return [...prev, { food, servings: 1 }];
    });
  };

  const removeItem = (foodId: string) => {
    setCurrentMealItems((prev) => prev.filter((i) => i.food.id !== foodId));
  };

  const updateServings = (foodId: string, servings: number) => {
    if (servings <= 0) { removeItem(foodId); return; }
    setCurrentMealItems((prev) => prev.map((i) => i.food.id === foodId ? { ...i, servings } : i));
  };

  const logMeal = () => {
    if (currentMealItems.length === 0) return;
    const newLog: MealLog = {
      id: `meal-${Date.now()}`,
      timestamp: new Date().toISOString(),
      mealType: selectedMealType,
      items: currentMealItems,
    };
    setAllMealLogs((prev) => [...prev, newLog]);
    setCurrentMealItems([]);
    setActiveTab("log");
  };

  const todaySummary: DailyNutritionSummary | null = allMealLogs.length > 0
    ? generateDailySummary(new Date().toISOString().split("T")[0], allMealLogs)
    : null;

  // Current meal macro totals
  const currentMealTotals = currentMealItems.reduce(
    (acc, item) => {
      const multiplier = (item.servings * item.food.servingSize) / 100;
      return {
        calories: acc.calories + item.food.macros.calories * multiplier,
        protein: acc.protein + item.food.macros.protein * multiplier,
        carbs: acc.carbs + item.food.macros.carbohydrates * multiplier,
        fat: acc.fat + item.food.macros.fat * multiplier,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="badge badge-safe mb-2">FoodTrack · Ethiopian EFCT 2025</div>
        <h2 className="text-xl font-bold text-white">Ethiopian Food Diary & Nutrition Tracker</h2>
        <p className="text-xs text-slate-400 mt-1">Log meals from the Ethiopian Food Composition Table with bioavailability-adjusted micronutrient tracking.</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-black/30 rounded-xl border border-white/5 w-fit">
        {(["add", "log", "summary"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            {tab === "add" ? "🔍 Add Food" : tab === "log" ? `📋 Meal Log (${allMealLogs.length})` : "📊 Daily Summary"}
          </button>
        ))}
      </div>

      {activeTab === "add" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Food Search */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search Ethiopian foods... (e.g., injera, misir, gomen)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-emerald-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                <option value="fermented">Fermented</option>
                <option value="legume">Legumes</option>
                <option value="vegetable">Vegetables</option>
                <option value="meat">Meat</option>
                <option value="dairy">Dairy</option>
                <option value="beverage">Beverages</option>
                <option value="cereal">Cereals</option>
              </select>
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {searchResults.map((food) => (
                <div
                  key={food.id}
                  className="glass-panel p-4 flex items-start justify-between gap-4 cursor-pointer hover:border-emerald-500/30 transition-all"
                  onClick={() => addFoodToMeal(food)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-sm truncate">{food.name}</span>
                      {food.nameAmharic && (
                        <span className="text-xs text-amber-400 font-medium shrink-0">{food.nameAmharic}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge badge-safe text-[10px] capitalize">{food.category}</span>
                      {food.bioavailabilityModifiers.fermented && (
                        <span className="text-[10px] text-emerald-400 font-semibold">🧫 Fermented</span>
                      )}
                      {food.WelbeingFlags.slice(0, 2).map((flag: string) => (
                        <span key={flag} className="text-[10px] text-slate-400 font-mono">{flag}</span>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-2 text-[11px] font-mono">
                      <span className="text-white font-bold">{food.macros.calories} cal</span>
                      <span className="text-blue-400">{food.macros.protein}g protein</span>
                      <span className="text-amber-400">{food.macros.carbohydrates}g carbs</span>
                      <span className="text-red-400">{food.macros.fat}g fat</span>
                    </div>
                  </div>
                  <button className="shrink-0 w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all text-lg font-bold flex items-center justify-center">
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Current Meal Builder */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel p-5">
              <h3 className="font-bold text-white mb-3">Current Meal</h3>

              <div className="mb-4">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">Meal Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((type) => {
                    const info = MEAL_TYPE_LABELS[type];
                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedMealType(type)}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${selectedMealType === type ? "bg-emerald-600/20 border-emerald-500 text-white" : "border-white/10 text-slate-400 hover:border-emerald-500/30"}`}
                      >
                        <span>{info.icon}</span>
                        <span>{info.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {currentMealItems.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p className="text-xs">Click foods on the left to add them to your meal</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4 max-h-[280px] overflow-y-auto">
                    {currentMealItems.map((item) => (
                      <div key={item.food.id} className="flex items-center gap-3 p-2 rounded-lg bg-black/30 border border-white/5">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{item.food.name}</div>
                          <div className="text-[10px] text-slate-500">{item.food.servingLabel}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => updateServings(item.food.id, item.servings - 1)} className="w-6 h-6 rounded bg-white/5 text-white text-sm hover:bg-white/10 flex items-center justify-center">−</button>
                          <span className="text-white text-xs font-bold w-6 text-center">{item.servings}</span>
                          <button onClick={() => updateServings(item.food.id, item.servings + 1)} className="w-6 h-6 rounded bg-white/5 text-white text-sm hover:bg-white/10 flex items-center justify-center">+</button>
                        </div>
                        <button onClick={() => removeItem(item.food.id)} className="text-rose-400 hover:text-rose-300 text-xs">✕</button>
                      </div>
                    ))}
                  </div>

                  {/* Macro summary */}
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5 mb-4">
                    <div className="text-xs font-bold text-slate-400 mb-2">Meal Totals</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-400">Calories:</span> <span className="text-white font-bold">{Math.round(currentMealTotals.calories)}</span></div>
                      <div><span className="text-slate-400">Protein:</span> <span className="text-blue-400 font-bold">{Math.round(currentMealTotals.protein * 10) / 10}g</span></div>
                      <div><span className="text-slate-400">Carbs:</span> <span className="text-amber-400 font-bold">{Math.round(currentMealTotals.carbs * 10) / 10}g</span></div>
                      <div><span className="text-slate-400">Fat:</span> <span className="text-red-400 font-bold">{Math.round(currentMealTotals.fat * 10) / 10}g</span></div>
                    </div>
                  </div>

                  <button onClick={logMeal} className="w-full btn-primary py-3 font-bold text-sm">
                    ✓ Log This Meal
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "log" && (
        <div className="space-y-3">
          {allMealLogs.length === 0 ? (
            <div className="glass-panel p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-slate-400">No meals logged today. Use the Add Food tab to log your first meal.</p>
            </div>
          ) : (
            allMealLogs.map((log) => {
              const mealInfo = MEAL_TYPE_LABELS[log.mealType];
              return (
                <div key={log.id} className="glass-panel p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">{mealInfo.icon}</span>
                    <div>
                      <span className={`font-bold text-sm ${mealInfo.color}`}>{mealInfo.label}</span>
                      <span className="text-xs text-slate-500 ml-2">{new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {log.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white/[0.02]">
                        <span className="text-slate-300">{item.food.name}</span>
                        <span className="text-slate-500 font-mono">×{item.servings} serving{item.servings > 1 ? "s" : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "summary" && (
        <div className="space-y-4">
          {!todaySummary ? (
            <div className="glass-panel p-12 text-center">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-slate-400">Log meals first to see your daily nutritional summary.</p>
            </div>
          ) : (
            <>
              {/* Macro Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Calories", value: Math.round(todaySummary.totalCalories), unit: "kcal", color: "text-white", target: 2000 },
                  { label: "Protein", value: Math.round(todaySummary.totalProtein), unit: "g", color: "text-blue-400", target: 55 },
                  { label: "Carbs", value: Math.round(todaySummary.totalCarbs), unit: "g", color: "text-amber-400", target: 260 },
                  { label: "Fat", value: Math.round(todaySummary.totalFat), unit: "g", color: "text-red-400", target: 65 },
                ].map((macro) => (
                  <div key={macro.label} className="glass-panel p-4 text-center">
                    <div className={`text-2xl font-black ${macro.color}`}>{macro.value}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{macro.label} {macro.unit}</div>
                    <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (macro.value / macro.target) * 100)}%`,
                          backgroundColor: macro.value > macro.target * 1.2 ? "#ef4444" : macro.value >= macro.target * 0.8 ? "#22c55e" : "#f59e0b",
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">{Math.round((macro.value / macro.target) * 100)}% of target</div>
                  </div>
                ))}
              </div>

              {/* Ethiopian Alignment Score */}
              <div className="glass-panel p-5 flex items-center gap-6">
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke={todaySummary.ethioAlignmentScore >= 70 ? "#22c55e" : todaySummary.ethioAlignmentScore >= 40 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="3" strokeDasharray={`${todaySummary.ethioAlignmentScore} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black text-white">{todaySummary.ethioAlignmentScore}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Ethiopian Food Alignment Score</div>
                  <p className="text-sm text-white font-semibold">
                    {todaySummary.ethioAlignmentScore >= 70 ? "Excellent — Deeply aligned with Ethiopian nutritional wisdom" :
                      todaySummary.ethioAlignmentScore >= 50 ? "Good — Some traditional practices incorporated" :
                        "Developing — Increase fermented foods, traditional spices, and cultural staples"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Based on EFCT 2025 criteria, fermented food inclusion, and cultural pattern alignment.</p>
                </div>
              </div>

              {/* Micronutrient Gaps */}
              <div className="glass-panel p-5">
                <h4 className="font-bold text-white mb-4">Micronutrient Status</h4>
                <div className="space-y-3">
                  {todaySummary.micronutrientGaps.map((gap) => {
                    const sev = SEVERITY_STYLES[gap.severity];
                    return (
                      <div key={gap.nutrient}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-300">{gap.nutrient}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-slate-400">{gap.achieved} / {gap.target}</span>
                            <span className={`text-[10px] font-bold ${sev.text}`}>{sev.label}</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${sev.bar}`}
                            style={{ width: `${Math.min(100, gap.percentOfTarget)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
