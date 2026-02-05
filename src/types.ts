export interface TestCase {
  id: string;
  prompt: string;
  constraints?: string[];
  required_patterns?: string[];
  forbidden_patterns?: string[];
  expected_pattern?: string;
}

export interface TestSuite {
  suite_id: string;
  name: string;
  description: string;
  cases: TestCase[];
}

export interface EvaluationResult {
  passed: boolean;
  errors: string[];
}
