
import React, { useState, useEffect } from 'react';
import { Feature, TDDStep, KataStepContent } from './types';
import { INITIAL_KATA_DATA } from './constants';
import { generateKataStep, explainTDDConcept } from './services/geminiService';
import CodeBlock from './components/CodeBlock';
import ProgressBar from './components/ProgressBar';
import FeatureCard from './components/FeatureCard';
import Analytics from './components/Analytics';

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature>(Feature.CRUD);
  const [currentStep, setCurrentStep] = useState<TDDStep>(TDDStep.RED);
  const [kataData, setKataData] = useState(INITIAL_KATA_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>('');

  const currentFeatureData = kataData.find(f => f.id === activeFeature);
  const currentStepData = currentFeatureData?.steps.find(s => s.step === currentStep);

  const handleNextStep = async () => {
    setLoading(true);
    setError(null);
    let nextStep: TDDStep = TDDStep.RED;
    let targetFeature = activeFeature;
    
    // Determine the next TDD state
    if (currentStep === TDDStep.RED) nextStep = TDDStep.GREEN;
    else if (currentStep === TDDStep.GREEN) nextStep = TDDStep.REFACTOR;
    else {
      // Logic to move to next feature after REFACTOR
      const features = Object.values(Feature);
      const currentIndex = features.indexOf(activeFeature);
      if (currentIndex < features.length - 1) {
        targetFeature = features[currentIndex + 1];
        nextStep = TDDStep.RED;
      } else {
        alert("🎉 Kata Mastery Achieved! You have successfully implemented all requirements.");
        setLoading(false);
        return;
      }
    }

    try {
      const context = currentStepData?.implementationCode || currentStepData?.testCode;
      const newStepContent = await generateKataStep(targetFeature, nextStep, context);

      setKataData(prev => prev.map(f => {
        if (f.id === targetFeature) {
          const exists = f.steps.some(s => s.step === nextStep);
          return {
            ...f,
            steps: exists 
              ? f.steps.map(s => s.step === nextStep ? newStepContent : s)
              : [...f.steps, newStepContent]
          };
        }
        return f;
      }));
      
      setActiveFeature(targetFeature);
      setCurrentStep(nextStep);
      const expl = await explainTDDConcept(nextStep, targetFeature);
      setExplanation(expl);
    } catch (err) {
      console.error(err);
      setError("The Craftsman Mentor is having trouble connecting. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getOverallProgress = () => {
    const totalSteps = Object.keys(Feature).length * 3;
    let completedSteps = 0;
    kataData.forEach(f => { completedSteps += f.steps.length; });
    return (completedSteps / totalSteps) * 100;
  };

  useEffect(() => {
    explainTDDConcept(TDDStep.RED, Feature.CRUD).then(setExplanation);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-xl shadow-slate-200 rotate-3 transition-transform hover:rotate-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86 1.43l-1.21.908a2 2 0 01-1.8 0l-1.21-.908a6 6 0 00-3.86-1.43l-2.387.477a2 2 0 00-1.022.547l1.022 1.022a2 2 0 001.022.547l2.387-.477a6 6 0 013.86-1.43l1.21-.908a2 2 0 001.8 0l1.21.908a6 6 0 013.86 1.43l2.387.477a2 2 0 001.022-.547l-1.022-1.022z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">Salary Master</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Incubyte Engineering Kata</p>
            </div>
          </div>
          <div className="w-72 hidden md:block">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
              <span>Kata Progression</span>
              <span>{Math.round(getOverallProgress())}%</span>
            </div>
            <ProgressBar progress={getOverallProgress()} />
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row p-6 gap-8">
        <aside className="w-full md:w-80 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5">Feature Modules</h2>
            <div className="space-y-3">
              {Object.values(Feature).map((feat) => (
                <FeatureCard 
                  key={feat}
                  feature={feat}
                  isActive={activeFeature === feat}
                  isCompleted={kataData.find(f => f.id === feat)?.steps.length === 3}
                  onClick={() => {
                    setActiveFeature(feat);
                    const featData = kataData.find(f => f.id === feat);
                    if (featData && featData.steps.length > 0) {
                      setCurrentStep(featData.steps[featData.steps.length - 1].step);
                    } else {
                      setCurrentStep(TDDStep.RED);
                    }
                  }}
                />
              ))}
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 p-7 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors" />
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
              Mentor Guidance
            </h2>
            <div className="text-sm font-medium leading-relaxed italic text-slate-300">
              {loading ? "Analyzing kata requirements..." : explanation}
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-100 text-red-600 p-5 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <span className="text-sm font-bold tracking-tight">{error}</span>
              </div>
              <button onClick={() => setError(null)} className="p-2 hover:bg-red-100 rounded-full transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          <div className="bg-white rounded-[2rem] border border-slate-200 p-2 shadow-sm flex items-center">
             <div className="flex space-x-1.5 flex-1">
               {Object.values(TDDStep).map((step) => (
                 <div 
                   key={step}
                   className={`flex-1 py-3 px-4 rounded-2xl text-center font-black text-xs transition-all duration-300 ${
                     currentStep === step 
                      ? (step === TDDStep.RED ? 'bg-red-500 text-white shadow-xl shadow-red-200' : 
                         step === TDDStep.GREEN ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-200' : 
                         'bg-indigo-500 text-white shadow-xl shadow-indigo-200')
                      : 'text-slate-300 hover:text-slate-400'
                   }`}
                 >
                   {step}
                 </div>
               ))}
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[600px] flex flex-col transition-all">
            <div className={`h-2 transition-colors duration-500 ${
                currentStep === TDDStep.RED ? 'bg-red-500' : 
                currentStep === TDDStep.GREEN ? 'bg-emerald-500' : 'bg-indigo-500'
            }`} />
            
            <div className="p-10 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-10">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 uppercase tracking-widest">{activeFeature}</span>
                    <span className="text-slate-200 font-light text-xl">/</span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                      currentStep === TDDStep.RED ? 'bg-red-50 text-red-600' : 
                      currentStep === TDDStep.GREEN ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>{currentStep} Phase</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    {currentStep === TDDStep.RED ? 'Make it Red' : 
                     currentStep === TDDStep.GREEN ? 'Make it Green' : 'Refactor Code'}
                  </h2>
                  <p className="text-slate-500 leading-relaxed max-w-xl text-base font-medium">
                    {currentStepData?.description || "Begin the cycle to generate your first technical challenge."}
                  </p>
                </div>
                
                <button 
                  onClick={handleNextStep}
                  disabled={loading}
                  className="group relative px-10 py-5 bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-[1.5rem] font-black transition-all shadow-2xl active:scale-95 overflow-hidden"
                >
                  <div className="relative z-10 flex items-center space-x-3">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span className="tracking-tight">Building...</span>
                      </>
                    ) : (
                      <>
                        <span className="tracking-tight">{currentStep === TDDStep.REFACTOR ? 'Move to Next' : 'Next Step'}</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </div>
                </button>
              </div>

              <div className="space-y-8 flex-1">
                {!currentStepData && !loading && (
                   <div className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[3rem] p-16 text-center group">
                      <div className="bg-slate-50 p-6 rounded-[2rem] mb-6 group-hover:scale-110 transition-transform">
                        <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <p className="text-xl font-black text-slate-900">Workbench Ready</p>
                      <p className="text-sm text-slate-400 mt-2 font-medium max-w-xs leading-relaxed">Click "Next Step" to let the mentor draft your first failing test for {activeFeature}.</p>
                   </div>
                )}

                {currentStepData?.testCode && (
                   <CodeBlock title="tests/salary.spec.ts" code={currentStepData.testCode} />
                )}
                
                {currentStepData?.implementationCode && (
                   <CodeBlock title="src/routes/salary.ts" code={currentStepData.implementationCode} />
                )}

                {currentStepData?.curlCommand && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                      <span>Terminal Verification</span>
                    </div>
                    <div className="bg-slate-900 rounded-3xl p-7 flex items-center justify-between border-b-4 border-slate-800 shadow-2xl">
                      <code className="text-emerald-400 text-sm font-mono overflow-x-auto whitespace-nowrap scrollbar-hide pr-6">
                        {currentStepData.curlCommand}
                      </code>
                      <button 
                        onClick={() => navigator.clipboard.writeText(currentStepData.curlCommand)}
                        className="flex-shrink-0 p-3 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all active:scale-90"
                        title="Copy Command"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {currentStepData?.commitMessage && (
                   <div className="bg-indigo-600/5 p-7 rounded-[2rem] border-2 border-indigo-100/50 group flex items-center justify-between hover:bg-indigo-600/10 transition-colors">
                     <div className="flex items-center space-x-5">
                       <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-100 group-hover:rotate-12 transition-transform">
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h10M7 12h10m-7 5h7" />
                         </svg>
                       </div>
                       <div>
                         <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Atomic Commit Message</p>
                         <p className="font-mono text-base text-indigo-900 font-bold">{currentStepData.commitMessage}</p>
                       </div>
                     </div>
                     <button 
                        onClick={() => navigator.clipboard.writeText(`git commit -m "${currentStepData.commitMessage}"`)}
                        className="bg-white p-3 rounded-xl border border-indigo-100 text-indigo-400 hover:text-indigo-600 hover:shadow-md transition-all active:scale-95"
                        title="Copy Commit Command"
                      >
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                     </button>
                   </div>
                )}
              </div>
            </div>
          </div>

          {activeFeature === Feature.METRICS && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Analytics 
                  countryMetrics={[
                    { name: 'India', min: 1200000, max: 1800000, avg: 1500000 },
                    { name: 'USA', min: 90000, max: 150000, avg: 120000 },
                    { name: 'UK', min: 60000, max: 60000, avg: 60000 }
                  ]} 
                  jobMetrics={[
                    { name: 'Software Engineer', avg: 155000 },
                    { name: 'Product Manager', avg: 142000 },
                    { name: 'QA Analyst', avg: 98000 }
                  ]}
                />
            </div>
          )}
        </main>
      </div>

      <footer className="bg-white border-t border-slate-100 py-10 px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm font-medium text-slate-400">
          <p>© 2025 Incubyte Craftsmanship Academy. "Small steps, big impact."</p>
          <div className="flex space-x-8 mt-6 md:mt-0">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="hover:text-slate-600 transition-colors uppercase tracking-widest text-[10px] font-black">API Docs</a>
            <a href="#" className="hover:text-slate-600 transition-colors uppercase tracking-widest text-[10px] font-black">Kata Guide</a>
            <a href="#" className="hover:text-slate-600 transition-colors uppercase tracking-widest text-[10px] font-black">Clean Code</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
