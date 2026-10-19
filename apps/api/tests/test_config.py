from app.config import DevelopmentConfig, ProductionConfig, TestingConfig, _env_flag


def test_dev_unlock_all_topics_defaults_off():
    assert DevelopmentConfig.DEV_UNLOCK_ALL_TOPICS is False


def test_dev_unlock_all_topics_is_never_defined_outside_development():
    """TestingConfig/ProductionConfig must not read DEV_UNLOCK_ALL_TOPICS
    at all -- not just default it to False -- so an env var leaking into
    either environment can never bypass prerequisite locking there.
    """
    assert "DEV_UNLOCK_ALL_TOPICS" not in vars(TestingConfig)
    assert "DEV_UNLOCK_ALL_TOPICS" not in vars(ProductionConfig)
    assert TestingConfig.DEV_UNLOCK_ALL_TOPICS is False
    assert ProductionConfig.DEV_UNLOCK_ALL_TOPICS is False


def test_env_flag_parses_truthy_and_falsy_values(monkeypatch):
    for value in ("1", "true", "True", "yes", "YES"):
        monkeypatch.setenv("SOME_FLAG", value)
        assert _env_flag("SOME_FLAG") is True

    for value in ("0", "false", "", "nope"):
        monkeypatch.setenv("SOME_FLAG", value)
        assert _env_flag("SOME_FLAG") is False


def test_env_flag_defaults_off_when_unset(monkeypatch):
    monkeypatch.delenv("SOME_UNSET_FLAG", raising=False)
    assert _env_flag("SOME_UNSET_FLAG") is False
