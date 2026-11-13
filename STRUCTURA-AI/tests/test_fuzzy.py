from fuzzy_logic import assess, memberships

def test_missing_model_requires_review():
    result = assess(0, 100, model_available=False)
    assert result['score'] is None and result['manual_review']

def test_poor_quality_never_high_reliability():
    result = assess(5, 5, model_available=True)
    assert result['reliability'] == 'LOW'
    assert 0 <= result['score'] <= 100

def test_memberships():
    assert memberships(0)['low'] == 1
    assert memberships(100)['high'] == 1
