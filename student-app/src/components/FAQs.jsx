import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from 'react-icons/fa';
import '../styles/FAQs.css';

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSections = [
    {
      title: 'Submitting a Request',
      items: [
        {
          question: "Can I submit a request outside office hours?",
          answer: "Yes. You can submit requests through the system at any time. However, school staff will process requests during official office hours."
        },
        {
          question: "Can I attach documents to my request?",
          answer: "Yes. You can upload relevant supporting documents when submitting a request, if required by the selected office or request type."
        },
        {
          question: "Can I submit multiple requests?",
          answer: "Yes. You can submit multiple requests when they concern different academic needs. Each request will have its own ticket for easier tracking."
        },
        {
          question: "Which school offices can I send requests to?",
          answer: "The system is designed to support academic requests handled by participating school offices, such as the Registrar, Library, Guidance Office, and Finance Office."
        }
      ]
    },
    {
      title: 'Tracking Your Request',
      items: [
        {
          question: "How can I check the status of my request?",
          answer: "Go to your submitted requests or ticket history. You can view the current status and updates of each request."
        },
        {
          question: "What do the ticket statuses mean?",
          answer: "Pending: Your request has been submitted and is waiting for processing.\n\nIn Progress: The assigned office is currently handling your request.\n\nResolved: The office has completed the request.\n\nClosed: The request has been completed and finalized."
        },
        {
          question: "How will I know if my request has been updated?",
          answer: "You can check your ticket status and view updates in the system. Notifications may also be provided when there are changes to your request."
        },
        {
          question: "How long will my request take?",
          answer: "Processing time depends on the type of request and the requirements involved. You can monitor your request status through the system."
        }
      ]
    },
    {
      title: 'Managing Your Request',
      items: [
        {
          question: "What should I do if I submitted incorrect information?",
          answer: "Contact the appropriate school office or follow the instructions provided in the system. Do not submit duplicate requests unless instructed to do so."
        },
        {
          question: "Can I cancel or modify a submitted request?",
          answer: "Request modification or cancellation depends on the current status of your ticket. Contact the appropriate school office for assistance."
        }
      ]
    },
    {
      title: 'Account & Security',
      items: [
        {
          question: "Is my personal information secure?",
          answer: "The system is designed to protect user information through secure authentication and controlled access. Only authorized users should have access to relevant request information."
        },
        {
          question: "What if I forget my password?",
          answer: "Use the available password recovery option or contact the designated school administrator for assistance."
        }
      ]
    },
    {
      title: 'Getting Help',
      items: [
        {
          question: "What should I do if I encounter a problem with the system?",
          answer: "Report the issue to the designated system administrator or school office. Provide details about the problem so it can be investigated and resolved."
        }
      ]
    }
  ];

  // Pre-compute the flat index of each item so the single-open accordion works across sections
  const sectionOffsets = [];
  let acc = 0;
  faqSections.forEach((section, i) => {
    sectionOffsets[i] = acc;
    acc += section.items.length;
  });

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faqs-container">
      <div className="faqs-inner">
        <div className="faqs-header">
          <FaQuestionCircle className="faqs-icon" aria-hidden="true" />
          <h1>Frequently Asked Questions</h1>
          <p className="faqs-subtitle">Find answers to common questions about the Student Request System</p>
        </div>

        <div className="faqs-sections">
          {faqSections.map((section, sIndex) => (
            <section key={sIndex} className="faq-section" aria-labelledby={`faq-section-${sIndex}`}>
              <h2 id={`faq-section-${sIndex}`} className="faq-section-title">
                {section.title}
              </h2>
              <div className="faq-section-list">
                {section.items.map((faq, iIndex) => {
                  const index = sectionOffsets[sIndex] + iIndex;
                  return (
                    <div
                      key={index}
                      className={`faq-item ${openIndex === index ? 'active' : ''}`}
                    >
                      <button
                        type="button"
                        className="faq-question"
                        onClick={() => toggleFAQ(index)}
                        aria-expanded={openIndex === index}
                      >
                        <span className="question-text">{faq.question}</span>
                        <span className="question-icon" aria-hidden="true">
                          {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                        </span>
                      </button>

                      <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
                        <div className="answer-content">
                          {faq.answer.split('\n\n').map((paragraph, pIndex) => (
                            <p key={pIndex}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="faqs-footer">
          <p>Still have questions?</p>
          <p>Contact the school office or submit a feedback through the system.</p>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
