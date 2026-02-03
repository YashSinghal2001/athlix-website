import Section from "../components/ui/Section";

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-brand-bg text-brand-text">
            <Section className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-bold mb-8 md:mb-12 text-center text-white">TERMS AND CONDITIONS</h1>

                <div className="space-y-8 text-brand-muted text-lg leading-relaxed">
                    {/* Medical disclaimer section */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">Medical Disclaimer</h2>
                        <p>[Medical disclaimer text from image]</p>
                    </section>

                    {/* Disclosure requirements */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">Disclosure Requirements</h2>
                        <p>[Disclosure requirements text from image]</p>
                    </section>

                    {/* No refund policy after plan delivery */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">Refund Policy</h2>
                        <p>[No refund policy text from image]</p>
                    </section>

                    {/* Communication expectations */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">Communication Expectations</h2>
                        <p>[Communication expectations text from image]</p>
                    </section>

                    {/* Teamwork & consistency statement */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">Teamwork & Consistency</h2>
                        <p>[Teamwork & consistency statement from image]</p>
                    </section>

                    {/* Mission statement */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">Mission Statement</h2>
                        <p>[Mission statement text from image]</p>
                    </section>

                    {/* Clarity & support statement */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">Clarity & Support</h2>
                        <p>[Clarity & support statement from image]</p>
                    </section>

                    <div className="h-px bg-brand-border my-8" />

                    {/* Money Back Guarantee section */}
                    <section>
                        <h2 className="text-2xl md:text-3xl font-bold text-brand-accent mb-6">MONEY BACK GUARANTEE:</h2>

                        <div className="space-y-6">
                            {/* "First 28 days" eligibility rule */}
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">Eligibility</h3>
                                <p>["First 28 days" eligibility rule text from image]</p>
                            </div>

                            {/* Required conditions list */}
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">Required Conditions</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>[Condition 1 from image]</li>
                                    <li>[Condition 2 from image]</li>
                                    <li>[Condition 3 from image]</li>
                                </ul>
                            </div>

                            {/* Guarantee void conditions */}
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">Guarantee Void If</h3>
                                <p>[Guarantee void conditions text from image]</p>
                            </div>

                            {/* Refund deduction explanation */}
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">Refund Deduction</h3>
                                <p>[Refund deduction explanation text from image]</p>
                            </div>
                        </div>
                    </section>
                </div>
            </Section>
        </div>
    );
}
