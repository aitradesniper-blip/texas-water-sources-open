import test from 'node:test';
import assert from 'node:assert/strict';
import {validateFreePropertyWaterApiOrigin as origin} from '../../source/lib/free-property-water-production-config.ts';
import {validateFeedbackFormEndpoint as feedback} from '../../source/lib/feedback-form-config.ts';
test('public API configuration accepts HTTPS origins and local development',()=>{assert.equal(origin(undefined),'');assert.equal(origin('https://example.org'),'https://example.org');assert.equal(origin('http://localhost:3001'),'http://localhost:3001')});
test('public API configuration rejects credential-bearing or ambiguous destinations',()=>{for(const value of ['https://user:pass@example.org','https://example.org?key=test','https://example.org/api','http://example.org','https://*.example.org']) assert.throws(()=>origin(value))});
test('feedback integration is optional locally and constrained when configured',()=>{assert.equal(feedback(undefined),'');assert.throws(()=>feedback(undefined,{required:true}));assert.throws(()=>feedback('https://example.org/f/test'));assert.throws(()=>feedback('https://formspree.io/f/test?token=example'));assert.equal(feedback('https://formspree.io/f/example'),'https://formspree.io/f/example')});
