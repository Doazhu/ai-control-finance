package finance

type Service struct {
	service *Service
}

func (s *Service) GetTransactions() []string {
	return []string{}
}
