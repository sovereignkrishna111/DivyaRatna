import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { useSiteSettings } from '../theme/siteSettings';
import { supabase } from '../lib/supabase';
import Reveal from './Reveal';

type Testimonial = {
  id?: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
};

const TestimonialsSection: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const { getAssetUrl } = useSiteSettings();

  const fallbackTestimonials = useMemo<Testimonial[]>(
    () => [
      {
        name: 'Nirmala Bishwakarma',
        role: 'Parent 1',
        content:
          'DRESS has provided our daughter with an exceptional education. The teachers are dedicated and caring, and the school environment fosters both academic excellence and personal growth.',
        rating: 5,
        image: getAssetUrl(
          'testimonial_1',
          'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        ),
      },
      {
        name: 'Krishna Bhattarai',
        role: 'Alumni - Class of 2020',
        content:
          'The foundation I received at DRESS prepared me exceptionally well for university. The critical thinking skills and leadership opportunities shaped who I am today.',
        rating: 5,
        image: getAssetUrl(
          'testimonial_2',
          'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        ),
      },
      {
        name: 'Nitesh Bk',
        role: 'Education Consultant',
        content:
          'DRESS stands out for its innovative teaching methods and commitment to holistic education. The school truly prepares students for the challenges of the 21st century.',
        rating: 5,
        image: getAssetUrl(
          'testimonial_3',
          'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        ),
      },
    ],
    [getAssetUrl]
  );

  const [dbTestimonials, setDbTestimonials] = useState<Testimonial[] | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('id,name,role,content,rating,image_url,storage_path,sort_order')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('updated_at', { ascending: false });

      if (!mounted) return;
      if (error || !data) {
        setDbTestimonials([]);
        return;
      }

      const next: Testimonial[] = (data as Array<Record<string, unknown>>).map((row) => {
        const name = typeof row.name === 'string' ? row.name : '';
        const role = typeof row.role === 'string' ? row.role : '';
        const content = typeof row.content === 'string' ? row.content : '';
        const ratingRaw = typeof row.rating === 'number' ? row.rating : 5;
        const rating = Math.max(0, Math.min(5, Math.floor(ratingRaw)));
        const imageUrl = typeof row.image_url === 'string' ? row.image_url : '';
        const storagePath = typeof row.storage_path === 'string' ? row.storage_path : '';

        let image = imageUrl;
        if (!image && storagePath) {
          const { data: pub } = supabase.storage.from('testimonials').getPublicUrl(storagePath);
          image = pub.publicUrl || '';
        }

        return {
          id: typeof row.id === 'string' ? row.id : undefined,
          name,
          role,
          content,
          rating,
          image,
        };
      });

      setDbTestimonials(next.filter((t) => t.name && t.content));
    };

    fetchAll();

    const ch = supabase
      .channel('realtime-public-testimonials')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, fetchAll)
      .subscribe();

    return () => {
      mounted = false;
      try {
        supabase.removeChannel(ch);
      } catch {
        void 0;
      }
    };
  }, []);

  const testimonials = (dbTestimonials && dbTestimonials.length > 0 ? dbTestimonials : fallbackTestimonials) as Testimonial[];

  useEffect(() => {
    if (currentTestimonial >= testimonials.length) {
      setCurrentTestimonial(0);
    }
  }, [currentTestimonial, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-16 bg-maroon-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12" variant="up">
          <h2 className="text-3xl md:text-4xl font-bold text-maroon-800 mb-4">
            What Our Community Says
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Hear from parents, students, and education experts about their experience with DRESS
          </p>
        </Reveal>

        <div className="relative max-w-4xl mx-auto">
          <Reveal as="div" variant="scale" className="bg-white rounded-lg shadow-xl p-8 md:p-12">
            <div className="flex items-center justify-center mb-6">
              <Quote className="h-12 w-12 text-maroon-300" />
            </div>
            
            <div className="text-center">
              <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </p>
              
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <div className="flex items-center justify-center">
                <img 
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-maroon-800">
                    {testimonials[currentTestimonial].name}
                  </h4>
                  <p className="text-gray-600">
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Navigation */}
          <Reveal as="div" variant="left" className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4">
            <button
              onClick={prevTestimonial}
              className="bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronLeft className="h-6 w-6 text-maroon-700" />
            </button>
          </Reveal>
          
          <Reveal as="div" variant="right" className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4">
            <button
              onClick={nextTestimonial}
              className="bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronRight className="h-6 w-6 text-maroon-700" />
            </button>
          </Reveal>

          {/* Indicators */}
          <Reveal as="div" variant="up" delayMs={100} className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTestimonial ? 'bg-maroon-700' : 'bg-maroon-300'
                }`}
              />
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;