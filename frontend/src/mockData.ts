import { ClauseInsight } from './types';

export const generateMockAnalysis = (perspective: 'disclosing' | 'receiving'): {
  summary: string;
  insights: ClauseInsight[];
} => {
  const isDisclosing = perspective === 'disclosing';

  return {
    summary: isDisclosing
      ? "This NDA contains several provisions that may place significant obligations on the Disclosing Party. The agreement includes broad confidentiality definitions, lengthy retention periods, and limited liability caps that could expose your confidential information to unnecessary risk. We've identified 8 key areas requiring attention, including 3 high-risk clauses that should be negotiated before signing."
      : "This NDA provides reasonable protections for the Receiving Party with standard confidentiality obligations. However, there are several clauses that impose strict liability and broad use restrictions that may limit your operational flexibility. We've identified 8 areas of concern, including 2 high-risk provisions related to damages and term duration that warrant careful review.",
    insights: [
      {
        id: '1',
        clauseNumber: '1.1',
        clauseTitle: 'Definition of Confidential Information',
        category: 'Definitions',
        riskLevel: 'medium',
        quote: '"Confidential Information" means all information, whether written, oral, or in any other form, disclosed by one party to the other, including but not limited to business plans, financial data, technical specifications, customer lists, and any information marked as confidential.',
        insight: isDisclosing
          ? 'The definition is overly broad and includes oral disclosures without requiring written confirmation. This could make it difficult to track what information is actually protected and may inadvertently bring non-confidential information under the agreement.'
          : 'This broad definition provides strong protection by capturing various forms of information. However, the inclusion of oral disclosures without written follow-up may make it challenging to prove what was actually disclosed as confidential.',
        suggestedChange: 'Limit the definition to information disclosed in written or electronic form, or require that oral disclosures be confirmed in writing within 10 business days to be considered confidential. Add explicit exclusions for information already known or independently developed.',
      },
      {
        id: '2',
        clauseNumber: '2.1',
        clauseTitle: 'Term and Duration',
        category: 'Time Periods',
        riskLevel: 'high',
        quote: 'This Agreement shall commence on the Effective Date and continue for a period of five (5) years. The confidentiality obligations shall survive termination and remain in effect for an additional ten (10) years.',
        insight: isDisclosing
          ? 'A 10-year post-termination confidentiality period is excessive for most business information and may be unenforceable. This extended timeline could also make it difficult to freely use your own information in future business dealings.'
          : 'The 10-year post-termination obligation is unusually long and may restrict your ability to use learnings from the relationship. Courts have found such extended periods unreasonable except for trade secrets.',
        suggestedChange: 'Reduce the post-termination period to 3 years for general confidential information, with an exception allowing up to 5 years only for information that constitutes bona fide trade secrets under applicable law.',
      },
      {
        id: '3',
        clauseNumber: '3.2',
        clauseTitle: 'Permitted Uses',
        category: 'Obligations',
        riskLevel: 'low',
        quote: 'Receiving Party shall use the Confidential Information solely for the purpose of evaluating a potential business relationship between the parties.',
        insight: 'This is a standard and appropriate use restriction that clearly defines the purpose. It prevents the receiving party from using your information for unrelated purposes or competitive advantage.',
        suggestedChange: 'No changes recommended. This clause provides clear boundaries and is standard for NDAs.',
      },
      {
        id: '4',
        clauseNumber: '4.1',
        clauseTitle: 'Return or Destruction',
        category: 'Obligations',
        riskLevel: 'medium',
        quote: 'Upon termination or at Disclosing Party\'s request, Receiving Party shall immediately return or destroy all Confidential Information, including all copies, notes, and derivatives, and provide written certification of such destruction.',
        insight: isDisclosing
          ? 'While this clause provides protection, it may be impractical in the digital age where information exists in backups and system logs. The requirement for written certification also adds administrative burden.'
          : 'The requirement to destroy "derivatives" is vague and could be interpreted to include your own work product. The certification requirement may also be burdensome, especially for large organizations with distributed data systems.',
        suggestedChange: 'Clarify that "derivatives" means only documents that reproduce confidential information verbatim. Add an exception for information retained in automatic backup systems, provided such information remains subject to confidentiality obligations and is not intentionally accessed.',
      },
      {
        id: '5',
        clauseNumber: '5.1',
        clauseTitle: 'Liability for Breach',
        category: 'Remedies',
        riskLevel: 'high',
        quote: 'Receiving Party acknowledges that breach of this Agreement will cause irreparable harm to Disclosing Party and agrees that Disclosing Party shall be entitled to seek injunctive relief without posting bond, in addition to all other remedies available at law or in equity, including monetary damages without limitation.',
        insight: isDisclosing
          ? 'While this clause provides strong remedies, the unlimited damages provision could be seen as punitive. Some jurisdictions may view this as overreaching, particularly the waiver of bond requirements.'
          : 'The unlimited damages clause exposes you to potentially catastrophic liability, even for inadvertent breaches. This is particularly concerning given the broad definition of confidential information and the lack of materiality threshold.',
        suggestedChange: 'Cap monetary damages at a reasonable multiple (e.g., 2-3x) of the actual harm or a fixed dollar amount. Retain injunctive relief for actual breaches but add a materiality threshold requiring that breaches be "material" before remedies apply.',
      },
      {
        id: '6',
        clauseNumber: '6.1',
        clauseTitle: 'Exclusions from Confidential Information',
        category: 'Definitions',
        riskLevel: 'low',
        quote: 'Confidential Information does not include information that: (a) is or becomes publicly available through no breach of this Agreement; (b) was rightfully in Receiving Party\'s possession before disclosure; (c) is rightfully received from a third party without breach; or (d) is independently developed without use of Confidential Information.',
        insight: 'These are standard and appropriate exclusions that protect both parties. They ensure that only truly confidential information is protected and prevent overreach.',
        suggestedChange: 'No changes recommended. These exclusions are standard and balanced.',
      },
      {
        id: '7',
        clauseNumber: '7.2',
        clauseTitle: 'Governing Law and Venue',
        category: 'Legal Terms',
        riskLevel: 'medium',
        quote: 'This Agreement shall be governed by the laws of the State of Delaware, without regard to its conflict of laws principles. Any disputes shall be resolved exclusively in the courts located in Wilmington, Delaware.',
        insight: isDisclosing
          ? 'Delaware law is generally business-friendly and its courts are experienced with commercial disputes. However, the exclusive venue clause requires you to litigate in Delaware regardless of where you are located, which could be costly and inconvenient.'
          : 'The exclusive Delaware venue could impose significant costs if you need to defend against a claim, particularly if your business is located elsewhere. Delaware law is well-developed but may favor the drafting party.',
        suggestedChange: 'Consider changing the venue to the state where your principal place of business is located, or add a provision allowing each party to bring suit in their home jurisdiction. Alternatively, consider arbitration as a neutral alternative.',
      },
      {
        id: '8',
        clauseNumber: '8.1',
        clauseTitle: 'No License Granted',
        category: 'Intellectual Property',
        riskLevel: 'low',
        quote: 'Nothing in this Agreement grants any license or right to Receiving Party under any patent, copyright, trademark, or other intellectual property right, except the limited right to use Confidential Information as expressly permitted herein.',
        insight: 'This is a protective clause that clarifies no intellectual property rights are being transferred. It prevents arguments that disclosure created an implied license.',
        suggestedChange: 'No changes recommended. This is a standard protective clause.',
      },
    ],
  };
};
