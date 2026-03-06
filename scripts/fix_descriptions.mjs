#!/usr/bin/env node
import fs from 'fs';

const descriptions = {
  'OpenAI': 'Creator of ChatGPT and GPT-4. Advanced AI research and deployment company.',
  'eToro': 'Social trading and multi-asset investment platform.',
  'Mollie UK': 'European payment service provider for online businesses.',
  'Payhawk UK': 'Spend management platform combining cards, expense management, and AP automation.',
  'Arbor Education': 'School management information system (MIS) for UK schools.',
  'Newcleo': 'Advanced nuclear reactor technology startup developing lead-cooled fast reactors.',
  'Maven Clinic UK': 'Digital health platform for women\'s and family healthcare.',
  'Google UK': 'Search, cloud computing, advertising, and consumer hardware. Major King\'s Cross HQ.',
  'Apple UK': 'Consumer electronics, software, and services. Battersea Power Station office.',
  'TikTok UK': 'Short-form video platform. Large London presence with content moderation and engineering.',
  'Salesforce UK': 'Cloud-based CRM and enterprise software platform with AI (Einstein) capabilities.',
  'Oracle UK': 'Enterprise database, cloud infrastructure, and business applications.',
  'SAP UK': 'Enterprise resource planning (ERP) and business software.',
  'Databricks UK': 'Unified analytics platform for data engineering, ML, and AI workloads.',
  'Snowflake UK': 'Cloud data platform for data warehousing and analytics.',
  'Palantir UK': 'Data analytics platform. Major UK government and NHS contracts.',
  'Adobe UK': 'Creative Cloud, Experience Cloud, and digital media software.',
  'Cisco UK': 'Networking hardware, telecommunications, and cybersecurity.',
  'Atlassian UK': 'Collaboration software including Jira, Confluence, and Trello.',
  'HubSpot UK': 'Inbound marketing, sales, and customer service software.'
};

const csv = fs.readFileSync('data/ecosystem.csv', 'utf8');
const lines = csv.split('\n');

const updated = lines.map(line => {
  if (!line || line.startsWith('id,')) return line;

  const parts = line.split(',');
  const name = parts[1];

  if (descriptions[name]) {
    parts[9] = descriptions[name];
    return parts.join(',');
  }

  return line;
});

fs.writeFileSync('data/ecosystem.csv', updated.join('\n'));
console.log(`Updated ${Object.keys(descriptions).length} company descriptions`);
