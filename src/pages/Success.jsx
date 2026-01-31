import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import { ProgressStoryVector } from "../components/illustrations/PremiumSvgs";

export default function Success() {
    return (
        <div className="px-4">
            <Section className="max-w-7xl mx-auto">
                <div className="relative">
                    <div className="hidden sm:block pointer-events-none absolute right-0 top-0 w-[560px] lg:w-[680px] text-white opacity-[0.06]">
                        <ProgressStoryVector className="w-full h-auto" />
                    </div>

                    <div className="relative z-10">
                        {/* Heading */}
                        <h1 className="text-4xl md:text-5xl font-bold">Real People. Real Transformations.</h1>

                        <p className="text-brand-muted max-w-3xl mt-6 text-lg">Every transformation you see here is the result of consistency, clarity, and coaching — not shortcuts or quick fixes.</p>

                        {/* Transformations Grid */}
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 mt-12">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="p-0 overflow-hidden border border-gray-800 hover:border-gray-600">
                                    <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-500">Transformation Preview</div>
                                    <div className="p-4">
                                        <p className="text-sm text-brand-muted">12–16 week transformation • Lifestyle focused</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
}
