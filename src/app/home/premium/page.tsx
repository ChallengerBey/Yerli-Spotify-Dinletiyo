"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Plan {
  id: string;
  plan_name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: any;
  audio_quality: string;
  max_offline_songs: number;
}

export default function PremiumPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansResponse, subResponse] = await Promise.all([
        fetch("/api/subscription/plans"),
        fetch("/api/subscription"),
      ]);

      const plansData = await plansResponse.json();
      const subData = await subResponse.json();

      if (plansData.plans) {
        setPlans(plansData.plans);
      }

      if (subData.subscription) {
        setCurrentSubscription(subData.subscription);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (planName: string) => {
    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_name: planName,
          billing_cycle: billingCycle,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Premium'a hoş geldin! 🎉");
        fetchData();
      } else {
        toast.error(data.error || "Abonelik başarısız");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    }
  };

  const cancelSubscription = async () => {
    try {
      const response = await fetch("/api/subscription", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Abonelik iptal edildi");
        fetchData();
      } else {
        toast.error("İptal başarısız");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    }
  };

  const getFeaturesList = (features: any) => {
    const featureList = [];
    if (!features.ads) featureList.push("Reklamsız dinleme");
    if (features.quality === "high") featureList.push("Yüksek kalite ses");
    if (features.offline) featureList.push("Offline dinleme");
    if (features.lyrics) featureList.push("Şarkı sözleri");
    if (features.rooms) featureList.push("Dinleme odaları");
    if (features.accounts) featureList.push(`${features.accounts} hesap`);
    return featureList;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">Premium'a Geç</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Sınırsız müzik deneyimi için en iyi planı seç
        </p>
      </div>

      {currentSubscription && currentSubscription.status === 'active' && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Mevcut Aboneliğin
            </CardTitle>
            <CardDescription>
              {currentSubscription.subscription_plans?.display_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Dönem sonu: {new Date(currentSubscription.current_period_end).toLocaleDateString('tr-TR')}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={cancelSubscription}>
              Aboneliği İptal Et
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="flex justify-center">
        <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as any)}>
          <TabsList>
            <TabsTrigger value="monthly">Aylık</TabsTrigger>
            <TabsTrigger value="yearly">
              Yıllık
              <Badge className="ml-2" variant="secondary">%17 İndirim</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const price = billingCycle === "yearly" ? plan.price_yearly : plan.price_monthly;
          const isPremium = plan.plan_name !== "free";
          const isCurrentPlan = currentSubscription?.subscription_plans?.plan_name === plan.plan_name;

          return (
            <Card
              key={plan.id}
              className={`relative ${isPremium ? "border-primary shadow-lg" : ""} ${
                isCurrentPlan ? "ring-2 ring-primary" : ""
              }`}
            >
              {isPremium && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                    Popüler
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {price === 0 ? "Ücretsiz" : `₺${price}`}
                    </span>
                    {price > 0 && (
                      <span className="text-muted-foreground">
                        / {billingCycle === "yearly" ? "yıl" : "ay"}
                      </span>
                    )}
                  </div>
                  {billingCycle === "yearly" && price > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      aylık ₺{(price / 12).toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {getFeaturesList(plan.features).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.max_offline_songs > 0 && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">
                        {plan.max_offline_songs.toLocaleString()} offline şarkı
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col min-h-[80px] justify-center">
                {isCurrentPlan ? (
                  <Button disabled className="w-full h-12">
                    Aktif Plan
                  </Button>
                ) : plan.plan_name === "free" ? (
                  <Button variant="outline" className="w-full h-12" disabled>
                    Mevcut Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full h-12"
                    onClick={() => subscribe(plan.plan_name)}
                    disabled={currentSubscription?.status === 'active'}
                  >
                    Başla
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Premium ile daha fazlası</h3>
            <p className="text-sm text-muted-foreground">
              İstediğin zaman iptal edebilirsin. Kredi kartı gerekmez.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
