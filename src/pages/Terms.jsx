import Section from "../components/ui/Section";

export default function Terms() {
    return (
        <div className="min-h-screen bg-white text-black">
            <Section className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-bold mb-8 md:mb-12 text-center text-[#02abff]">TERMS AND CONDITIONS</h1>

                <div className="space-y-8 text-black text-lg leading-relaxed">
                    <ul className="space-y-6 list-disc pl-5">
                        <li>Athlix does not provide medical advice. Please consult a physician before starting any new fitness or nutrition program.</li>
                        <li>All medical conditions or injuries must be disclosed before starting the plan.</li>
                        <li>Once your personalized plan has been delivered, all sales are final no refunds.</li>
                        <li>Respectful communication is expected between clients and the coaching team.</li>
                        <li>Transformations are a result of teamwork.</li>
                        <li>There will be ups and downs, but consistency and communication will ensure success.</li>
                        <li>Our mission is simple: to give our 100% so that you can achieve lasting transformation.</li>
                        <li>Please read all details before enrolling to ensure full clarity.</li>
                        <li>If anything feels unclear, reach out I’m here to help.</li>
                    </ul>

                    <div className="h-px bg-gray-200 my-8" />

                    <section>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#02abff] mb-6">MONEY BACK GUARANTEE:</h2>

                        <div className="space-y-6">
                            <p>The guarantee applies only within the first 28 days after your plan starts. To qualify, you must:</p>

                            <ul className="list-disc pl-5 space-y-2">
                                <li>Follow the program as instructed.</li>
                                <li>Complete all weekly check-ins on time.</li>
                                <li>Communicate any issues immediately so adjustments can be made.</li>
                            </ul>

                            <p>Missed check-ins or lack of communication will void the guarantee.</p>

                            <p>If a refund is processed, plan creation and service fees will be deducted since each plan is fully customized and proprietary.</p>
                        </div>
                    </section>
                </div>
            </Section>
        </div>
    );
}
